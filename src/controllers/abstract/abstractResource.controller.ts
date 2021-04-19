import { Request } from 'express';
import { FilterQuery } from 'mongoose';
import { ErrorHelper } from '../../helpers/error.helper';
import { APIResponse } from '../../models/apiResponse.model';
import { ModelWrite, ModelRead } from '../../models/mongoose/base.model';
import { AbstractService } from '../../services/abstract/abstract.service';
import { HttpErrorCode } from '../../utils/httpErrorCode.enum';
import { HttpSuccessCode } from '../../utils/httpSuccessCode.enum';
import { AbstractController } from './abstract.controller';

/**
 * Abstract Resource Controller, serving as the foundation of the API's Entity-CRUD request processing layer
 *
 * Implements GET, POST, PUT and DELETE handlers for a single given Model, deferring database interactivity to a single Service
 *
 * Implements validation
 *
 * Controllers which serve a particular Model should extend this class
 *
 * @typeparam TWrite the 'writeable' Model representation, to be received in request bodies for create + update
 * @typeparam TRead the 'as-read' Model representation, as read from the database and broadcast in responses
 */
export abstract class AbstractResourceController<TWrite extends ModelWrite, TRead extends ModelRead> extends AbstractController {

    /**
     * Constructor. Take and store the Service to use and the name of the Entity's unique identifier to be used in single-Entity lookups
     *
     * @param service the Service to use
     * @param identifierName the name the unique identifier, to be matched in request parameters
     */
    constructor(protected service: AbstractService<TWrite, TRead>, protected identifierName: string) {
        super();
    }

    /**
     * Generic GET handler, supporting both single lookups for a single Entity and queried or unqueried lookups for many Entities
     *
     * @param req the Express Request
     *
     * @returns the found Documents
     */
    public async get(req: Request): Promise<APIResponse<TRead | Array<TRead>>> {
        if (req.params[this.identifierName]) {
            return await this.getOne(req.params[this.identifierName]);
        }

        return await this.getAll();
    }

    /**
     * // TODO
     *
     * @param req
     * @returns
     */
    public async create(req: Request): Promise<APIResponse<TRead>> {
        // TODO validate req.body

        const data = await this.service.create(req.body);

        return {
            status: HttpSuccessCode.CREATED,
            data
        };
    }

    /**
     * // TODO
     *
     * @param req
     * @returns
     */
    public async update(req: Request): Promise<APIResponse<TRead>> {
        // TODO validate req.body
        const data = await this.service.update(req.body);

        await new Promise((r) => r(true));

        return {
            status: HttpSuccessCode.OK,
            data: { _id: '23458234823' } as TRead
        }
    }

    /**
     * // TODO
     *
     * @param req
     * @returns
     */
    public async delete(req: Request): Promise<APIResponse<boolean>> {
        await new Promise((r) => r(true));

        return {
            status: HttpSuccessCode.OK,
            data: true
        };
    }

    /**
     * Overrideable single Entity retrieval routine, querying by the identifier name to return one result
     *
     * @param identifier the value of the identifier as supplied in query params
     *
     * @returns the found Entity
     */
    protected async getOne(identifier: string): Promise<APIResponse<TRead>> {
        const identifierQuery = this.buildIdentifierQuery(identifier);

        const found = await this.service.findOne(identifierQuery);

        if (!found) {
            throw ErrorHelper.createError(
                HttpErrorCode.NOT_FOUND,
                `No Entity found with identifier ${JSON.stringify(identifierQuery)}`
            );
        }

        return {
            status: HttpSuccessCode.OK,
            data: found
        };
    }

    /**
     * Overrideable multi Entity retrieval routine, retrieving all Entities
     *
     * @returns the found Entities
     */
    protected async getAll(): Promise<APIResponse<Array<TRead>>> {
        return {
            status: HttpSuccessCode.OK,
            data: await this.service.findMany()
        };
    }

    /**
     * Reusable internal utility for building a single-Entity query based on the Entity's unique identifier
     *
     * @param identifier the identifier value
     *
     * @returns the FilterQuery for passing to the Service
     */
    protected buildIdentifierQuery(identifier: string): FilterQuery<TRead> {
        return { [`${this.identifierName}`]: identifier } as FilterQuery<TRead>;
    }
}
