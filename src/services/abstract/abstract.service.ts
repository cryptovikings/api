import { FilterQuery, PaginateOptions, PaginateResult, PaginateModel } from 'mongoose';
import _mergeWith from 'lodash.mergewith';

import { HttpErrorCode } from '../../enums/httpErrorCode.enum';
import { ErrorHelper } from '../../helpers/error.helper';
import { Paginate, Select, Sort, Where } from '../../models/apiQuery.model';
import { ModelRead, ModelWrite } from '../../models/mongoose/base.model';

/**
 * AbstractService, serving as the foundation of the API's Database Interaction layer
 *
 * Implements Database-interactive behaviours for GET, POST, PUT and DELETE for a single given Model
 *
 * One extending class should exist per Database Collection, associated strongly with a Controller serving the Entity's route collection
 *
 * @typeparam TWrite the 'writeable' Model representation, to be received in request bodies for create + update
 * @typeparam TRead the 'as-read' Model representation, as read from the database
 */
export abstract class AbstractService<TWrite extends ModelWrite, TRead extends ModelRead> {

    /**
     * Model Name
     */
    public modelName: string;

    /**
     * Constructor. Take and store the Mongoose PaginateModel to use
     *
     * @param model the Model
     */
    constructor(public model: PaginateModel<TRead>) {
        this.modelName = model.modelName;
    }

    /**
     * Find one Document with a given identifier-based query
     *
     * @param identifierQuery the query
     * @param select Mongo Projection set
     *
     * @returns the found Document or null if none was found
     */
    public async findOne(identifierQuery: FilterQuery<TRead>, select: Select): Promise<TRead | null> {
        return await this.model.findOne(identifierQuery, select);
    }

    /**
     * Find many Documents by a given query
     *
     * @param where the Mongo query
     * @param select the Mongo Projection set
     * @param sort the Mongo Sort set
     * @param paginate pagination rules
     *
     * @returns the found Document or null if none were found
     */
    public async findMany(where: Where, select: Select, sort: Sort, paginate: Paginate): Promise<PaginateResult<TRead>> {
        // set up some pagination options
        const paginateOptions: PaginateOptions = {
            collation: { locale: 'en' },
            select,
            sort: sort?.join(' ') ?? ''
        };

        // configure the pagination itself
        if (paginate) {
            paginateOptions.page = paginate.page;
            paginateOptions.limit = paginate.limit;
        }
        else {
            paginateOptions.pagination = false;
        }

        // use mongoose paginate to query the collection
        return await this.model.paginate(where, paginateOptions);
    }

    /**
     * Create a single Document
     *
     * Separated from createOne for type narrowing purposes
     *
     * @param data the data representing the Document to create
     *
     * @returns the created Document
     */
    public async createOne(data: TWrite): Promise<TRead> {
        return await this.model.create(data);
    }

    /**
     * Create many Documents
     *
     * Separated from createOne for type narrowing purposes
     *
     * @param data an array of data representing the Documents to create
     *
     * @returns the created Documents
     */
    public async createMany(data: Array<TWrite>): Promise<Array<TRead>> {
        return await this.model.create(data);
    }

    /**
     * Update one Document, found by an identifier-based query
     *
     * Implements updates by (Document).save() so as to be able to return the actual updated Document data, and so as to activate Model pre('save')
     *   hooks. Also allows us to throw errors for document not found or readonly document update attempts
     *
     * @param identifierQuery the query
     * @param data the data representing the Document changes to write
     *
     * @returns the updated Document
     */
    public async updateOne(identifierQuery: FilterQuery<TRead>, data: DeepPartial<TWrite>): Promise<TRead> {
        const doc = await this.findOne(identifierQuery, []);

        if (!doc) {
            throw ErrorHelper.errors.notFound(
                `Could not update a ${this.modelName} - no Document found with identifier ${JSON.stringify(identifierQuery)}`
            );
        }

        // throw an explicit error for update attempts on readonly Documents
        if (doc.readonly) {
            throw ErrorHelper.errors.forbidden(
                `Could not update the ${this.modelName} found with identifier ${JSON.stringify(identifierQuery)} - Document is readonly`
            );
        }

        // using lodash.mergewith to allow for partial deep object-field overwrites
        _mergeWith(doc, data, (docValue, dataValue) => {
            // overwrite Array fields
            if (Array.isArray(docValue)) {
                return dataValue as unknown;
            }

            // allow for voiding fields in the target document by providing an explicit 'undefined' in the data
            if (dataValue === undefined) {
                return null;
            }
        });

        // handle Mongoose weirdness with failing to detect some document updates by explicitly marking the augmented fields as modified
        for (const key of Object.keys(data)) {
            doc.markModified(key);
        }

        return await doc.save();
    }

    /**
     * Delete one Document, found by an identifier-based query
     *
     * Implements deletes by (Document).remove() so as to activate Model pre('remove') hooks. Also allows us to throw errors for document not found
     *   or readonly document delete attempts
     *
     * // TODO might wanna re-evaluate this
     *
     * @param identifierQuery the query
     *
     * @returns the number of Documents affected
     */
    public async deleteOne(identifierQuery: FilterQuery<TRead>): Promise<{ deleted: number }> {
        const doc = await this.findOne(identifierQuery, []);

        if (!doc) {
            throw ErrorHelper.errors.notFound(
                `Could not delete a ${this.modelName} - no Document found with identifier ${JSON.stringify(identifierQuery)}`
            );
        }

        // throw an explicit error for delete attempts on readonly Documents
        if (doc.readonly) {
            throw ErrorHelper.errors.forbidden(
                `Could not delete the ${this.modelName} found with identifier ${JSON.stringify(identifierQuery)} - Document is readonly`
            );
        }

        await doc.remove();

        return { deleted: 1 };
    }

    /**
     * Delete many Documents, found by a given Query
     *
     * Implements deletes by (Model).deleteMany(), unlike deleteOne(), for efficiency. Ensures that readonly Documents are not deleted by augmenting
     *   the incoming query
     *
     * // TODO might wanna re-evaluate this
     *
     * @param where the query matching Documents to delete
     */
    public async deleteMany(where: Where): Promise<{ deleted: number }> {
        // add { readonly: false } to the query to prevent deletes on readonly Documents
        const deleted = await this.model.deleteMany(Object.assign({ readonly: false }, where));

        return {
            deleted: deleted.deletedCount ?? deleted.n ?? 0
        };
    }
}
