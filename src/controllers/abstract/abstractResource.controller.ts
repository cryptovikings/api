import { Request } from 'express';
import { FilterQuery } from 'mongoose';

import { APIQuery } from '../../models/utils/apiQuery.model';
import { APIModel } from '../../models/base.model';
import { ModelTransformer } from '../../models/model.transformer';
import { AbstractService } from '../../services/abstract/abstract.service';
import { HttpSuccessCode } from '../../enums/httpSuccessCode.enum';
import { AbstractController } from './abstract.controller';
import { ErrorHelper } from '../../helpers/error.helper';
import { APIResponse } from '../../models/utils/apiResponse.model';

/**
 * Abstract Resource Controller, generically implementing CRUD routines, validation and model transformation for Entity-related Request
 *   Processing
 *
 * Controllers which serve a route collection associated with a particular database collection should extend from this class
 *
 * Provides support for a series of query parameters which expose Mongo/Mongoose functionality to the outside world:
 *     - where => a Mongo query object
 *     - select => an array of strings defining a Mongo projection set
 *     - sort => an array of strings defining a Mongo sort
 *     - paginate => an object defining page + limit properties defining a Mongoose Pagination rule
 *
 * @typeparam TModel the Model supertype to work with
 */
export abstract class AbstractResourceController<TModel extends APIModel> extends AbstractController {

    /**
     * Optional default Mongo selection set implementable in the subclass
     *
     * Enables the assurance that a particular field or field set will always be retrieved on GETs, allowing for Transformer confidence
     */
    protected defaultSelect: APIQuery['select'] | undefined;

    /**
     * Optional default Mongo sort set implementable in the subclass
     *
     * Enables a Controller to define *primary* sort rule(s) for all multi-Entity GETs
     */
    protected defaultSort: APIQuery['sort'] | undefined;

    /**
     * Optional default data structure to be returned on single-Entity GETs which do not match any Document
     *
     * Enables a Controller to override the default abstract error-throwing behaviour for 404/Not Found errors
     */
    protected defaultData: TModel['broadcast'] | undefined;

    /**
     * Constructor. Take and store the Service to use, the ModelTransformer implementing Model conversion routines, and the name of the
     *   Entity's unique identifier to be used in single-Entity lookups
     *
     * @param service the Service to use
     * @param transformer the ModelTransformer to use
     * @param identifierName the name the unique identifier, to be matched in request parameters
     */
    constructor(
        protected service: AbstractService<TModel>,
        protected transformer: ModelTransformer<TModel>,
        protected identifierName: string
    ) {
        super();
    }

    /**
     * Generic GET handler, supporting both single lookups for a single Entity and queried or unqueried lookups for many Entities
     *
     * @param req the Express Request
     *
     * @returns an APIResponse containing the found Entity/Entities
     */
    public get(req: Request): Promise<APIResponse<DeepPartial<TModel['broadcast']> | Array<DeepPartial<TModel['broadcast']>>>> {
        const { where, select, sort, paginate } = this.parseQuery(req);

        // if our identifierName is found in the request parameters, retrieve a single Entity
        if (req.params[this.identifierName]) {
            return this.getOne(req.params[this.identifierName], select);
        }

        // if there is a where in the query params, retrieve "some" Entities
        if (where) {
            return this.getMany(where, select, sort, paginate);
        }

        // retrieve all Entities
        return this.getMany({}, select, sort, paginate);
    }

    /**
     * Generic POST handler, supporting both single and multi Entity creation
     *
     * // TODO Implements validation for the incoming data
     *
     * @param req the Express Request
     *
     * @returns an APIResponse containing the created Entity/Entities
     */
    public create(req: Request): Promise<APIResponse<TModel['broadcast'] | Array<TModel['broadcast']>>> {
        // handle an empty body with the appropriate error
        if (!Object.keys(req.body).length) {
            throw ErrorHelper.errors.emptyBody;
        }

        // if the body is an array, create many Entities
        if (Array.isArray(req.body)) {
            return this.createMany(req.body);
        }

        // create one Entity
        return this.createOne(req.body);
    }

    /**
     * Generic PUT handler, supporting single Entity updates (no multi Entity for now)
     *
     * // TODO Implements validation for the incoming data
     *
     * @param req the Express Request
     *
     * @returns an APIResponse containing the updated Entity
     */
    public update(req: Request): Promise<APIResponse<TModel['broadcast']>> {
        // if our identifierName is found in the request parameters, update a single Entity
        if (req.params[this.identifierName]) {
            return this.updateOne(req.params[this.identifierName], req.body);
        }

        // if not, for now, error
        throw ErrorHelper.errors.notImplemented;
    }

    /**
     * Generic DELETE handler, supporting both single Entity deletion and queried multi Entity deletion
     *
     * Does not support unqueried (all) Entity deletion
     *
     * @param req the Express Request
     *
     * @returns an APIResponse containing a deletion success flag
     */
    public delete(req: Request): Promise<APIResponse<{ deleted: number }>> {
        const { where } = this.parseQuery(req);

        // if our identifierName is found in the request parameters, delete a single Entity
        if (req.params[this.identifierName]) {
            return this.deleteOne(req.params[this.identifierName]);
        }

        // if there is a where in the query params, delete "some" Entities
        if (where) {
            return this.deleteMany(where);
        }

        // do not allow deleting all Entities by way of unqueried/unparameterised DELETEs
        throw ErrorHelper.errors.notImplemented;
    }

    /**
     * Overrideable single Entity retrieval routine, querying by the identifier name to return one result
     *
     * Potentially returns the Controller's defaultData if the query does not find an Entity
     *
     * @param identifier the value of the identifier as supplied in query params
     * @param select the Mongo Projection set
     *
     * @returns An APIResponse containing the found Entity
     */
    protected async getOne(identifier: string, select?: APIQuery['select']): Promise<APIResponse<DeepPartial<TModel['broadcast']>>> {
        const identifierQuery = this.buildIdentifierQuery(identifier);

        const found = await this.service.findOne(identifierQuery, select);

        if (found) {
            return {
                status: HttpSuccessCode.OK,
                data: this.transformer.convertForBroadcast(found, select)
            };
        }

        // fall back to defaultData before resorting to throwing a NOT_FOUND
        if (this.defaultData) {
            return {
                status: HttpSuccessCode.OK,
                data: this.defaultData
            };
        }

        throw ErrorHelper.errors.notFound(`No ${this.service.modelName} found with identifier ${JSON.stringify(identifierQuery)}`);
    }

    /**
     * Overrideable multi Entity retrieval routine, querying by a given where to return many results
     *
     * @param where the Mongo query
     * @param select the Mongo Projection set
     * @param sort the Mongo Sort set
     * @param paginate pagination rules
     *
     * @returns An APIResponse containing the found Entities
     */
    protected async getMany(
        where: NonNullable<APIQuery['where']>, select?: APIQuery['select'], sort?: APIQuery['sort'], paginate?: APIQuery['paginate']
    ): Promise<APIResponse<Array<DeepPartial<TModel['broadcast']>>>> {

        const result = await this.service.findMany(where, select, sort, paginate);

        if (result.docs.length) {
            return {
                status: HttpSuccessCode.OK,
                data: this.transformer.convertManyForBroadcast(result.docs, select),
                paginate: {
                    total: result.totalDocs,
                    count: result.docs.length,
                    page: result.page ?? 1,
                    pages: result.totalPages,
                    hasNext: result.hasNextPage,
                    hasPrev: result.hasPrevPage
                }
            };
        }

        throw ErrorHelper.errors.notFound(`No ${this.service.modelName} found with query ${JSON.stringify(where)}`);
    }

    /**
     * Overrideable single Entity creation routine
     *
     * @param body the data representing the Entity to create
     *
     * @returns An APIResponse containing the created Entity
     */
    protected async createOne(body: TModel['write']): Promise<APIResponse<TModel['broadcast']>> {
        const single = await this.service.createOne(body);

        return {
            status: HttpSuccessCode.CREATED,
            data: this.transformer.convertForBroadcast(single)
        };
    }

    /**
     * Overrideable multi Entity creation routine
     *
     * @param body an array of data representing the Entities to create
     *
     * @returns an APIResponse containing the created Entities
     */
    protected async createMany(body: Array<TModel['write']>): Promise<APIResponse<Array<TModel['broadcast']>>> {
        const multi = await this.service.createMany(body);

        return {
            status: HttpSuccessCode.CREATED,
            data: this.transformer.convertManyForBroadcast(multi)
        };
    }

    /**
     * Overrideable single Entity update routine
     *
     * @param identifier the value of the identifier as supplied in query params
     * @param body the data representing the changes to make to the Entity
     *
     * @returns An APIResponse containing the updated Entity
     */
    protected async updateOne(identifier: string, body: DeepPartial<TModel['write']>): Promise<APIResponse<TModel['broadcast']>> {
        const identifierQuery = this.buildIdentifierQuery(identifier);

        const updated = await this.service.updateOne(identifierQuery, body);

        return {
            status: HttpSuccessCode.OK,
            data: this.transformer.convertForBroadcast(updated)
        };
    }

    /**
     * Overrideable single Entity deletion routine
     *
     * @param identifier the value of the identifier as supplied in query params
     *
     * @returns An APIResponse containing a deletion success flag
     */
    protected async deleteOne(identifier: string): Promise<APIResponse<{ deleted: number }>> {
        const identifierQuery = this.buildIdentifierQuery(identifier);

        return {
            status: HttpSuccessCode.OK,
            data: await this.service.deleteOne(identifierQuery)
        }
    }

    /**
     * Overrideable multi Entity deletion routine
     *
     * @param where the Mongo query matching Entities to delete
     *
     * @returns An APIResponse containing a deletion success flag
     */
    protected async deleteMany(where: NonNullable<APIQuery['where']>): Promise<APIResponse<{ deleted: number }>> {
        return {
            status: HttpSuccessCode.OK,
            data: await this.service.deleteMany(where)
        };
    }

    /**
     * Reusable internal utility for building a single-Entity query based on the Entity's unique identifier
     *
     * @param identifier the identifier value
     *
     * @returns the FilterQuery for passing to the Service
     */
    protected buildIdentifierQuery(identifier: string): FilterQuery<TModel['read']> {
        return { [`${this.identifierName}`]: identifier } as FilterQuery<TModel['read']>;
    }

    /**
     * Extract and parse the query parts for use in Entity finds
     *
     * @param req the Express Request
     *
     * @returns the APIQuery
     */
    protected parseQuery(req: Request): APIQuery {
        let where: APIQuery['where'];
        let select: APIQuery['select'];
        let sort: APIQuery['sort'] = this.defaultSort ?? [];
        let paginate: APIQuery['paginate'];

        if (Object.keys(req.query).length) {
            where = req.query.where ? JSON.parse(req.query.where as string) : undefined;
            select = req.query.select ? JSON.parse(req.query.select as string) : undefined;
            sort = req.query.sort ? sort.concat(JSON.parse(req.query.sort as string)) : undefined;
            paginate = req.query.paginate ? JSON.parse(req.query.paginate as string) : undefined;
        }

        // if there's a selection, combine it with our optional default selection set and then validate it
        if (select) {
            select = select.concat(this.defaultSelect ?? []);
            this.validateSelect(select);
        }

        return {
            where,
            select,
            sort,
            paginate
        };
    }

    /**
     * Selection set validation routine. Validate that the set includes only inclusions *or* exclusions, ensuring that it's compatible with
     *   Mongo
     *
     * Allows for the provision of a nicer and more specific Controller-level error than we'd get if we passed a mixed projection set down
     *   to the Service layer
     *
     * In line with Mongo Projection rules, allow for _id inclusion or exclusion regardless of the rest of the set
     *
     * Pass-through validation method; throws an error if validation fails
     *
     * @param select the Select to validate
     */
    protected validateSelect(select: NonNullable<APIQuery['select']>): void {
        let last = undefined;

        for (const s of select) {
            if (s.includes('_id')) {
                continue;
            }

            const current = s.startsWith('-');

            if (last !== undefined && current !== last) {
                throw ErrorHelper.errors.badRequest(`Cannot mix includes and excludes in select: [${select.join(', ')}]`);
            }

            last = current;
        }
    }
}
