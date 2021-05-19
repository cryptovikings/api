import { PaginateOptions, PaginateResult, PaginateModel } from 'mongoose';
import _mergeWith from 'lodash/mergeWith';

import { ErrorHelper } from '../../helpers/error.helper';
import { APIQuery } from '../../models/utils/apiQuery.model';
import { APIModel } from '../../models/base.model';

/**
 * AbstractService, serving as the foundation of the API's Database Interaction layer
 *
 * Implements Database-interactive behaviours for GET, POST, PUT and DELETE for a single given Model
 *
 * One extending class should exist per Database Collection, associated strongly with a Controller serving the Entity's route collection
 *
 * @typeparam TModel the Model supertype to work with
 */
export abstract class AbstractService<TModel extends APIModel> {

    /**
     * Model Name
     */
    public readonly modelName: string;

    /**
     * Constructor. Take and store the Mongoose PaginateModel to use
     *
     * @param model the Model
     */
    constructor(public readonly model: PaginateModel<TModel['read']>) {
        this.modelName = model.modelName;
    }

    /**
     * Count all Documents in the collection
     *
     * @returns the number of Documents in the collection
     */
    public async count(where: NonNullable<APIQuery['where']>): Promise<number> {
        return await this.model.countDocuments(where);
    }

    /**
     * Find one Document with a given identifier-based query
     *
     * @param identifierQuery the query
     * @param select Mongo Projection set
     *
     * @returns the found Document or null if none was found
     */
    public async findOne(identifierQuery: NonNullable<APIQuery['where']>, select?: APIQuery['select']): Promise<TModel['read'] | null> {
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
    public async findMany(
        where?: APIQuery['where'], select?: APIQuery['select'], sort?: APIQuery['sort'], paginate?: APIQuery['paginate']
    ): Promise<PaginateResult<TModel['read']>> {

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
    public async createOne(data: TModel['write']): Promise<TModel['read']> {
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
    public async createMany(data: Array<TModel['write']>): Promise<Array<TModel['read']>> {
        return await this.model.create(data);
    }

    /**
     * Update one Document, found by an identifier-based query
     *
     * Implements updates by (Document).save() so as to be able to return the actual updated Document data, and so as to activate Model pre('save')
     *   hooks. Also allows us to throw errors for document not found or readonly field update attempts
     *
     * @param identifierQuery the query
     * @param data the data representing the Document changes to write
     *
     * @returns the updated Document
     */
    public async updateOne(identifierQuery: NonNullable<APIQuery['where']>, data: DeepPartial<TModel['write']>): Promise<TModel['read']> {
        const doc = await this.findOne(identifierQuery, []);
        if (!doc) {
            throw ErrorHelper.errors.notFound(
                `Could not update a ${this.modelName} - no Document found with identifier ${JSON.stringify(identifierQuery)}`
            );
        }

        const readonlyConflicts = this.readonlyConflicts(doc, data);
        if (readonlyConflicts) {
            throw ErrorHelper.errors.forbidden(
                `Could not update the ${this.modelName} found with identifier ${JSON.stringify(identifierQuery)} : ${readonlyConflicts}`
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
     * @param identifierQuery the query
     *
     * @returns the number of Documents affected
     */
    public async deleteOne(identifierQuery: NonNullable<APIQuery['where']>): Promise<{ deleted: number }> {
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
     *   the incoming query, at the sacrifice of the ability to error for attempts at deleting readonly documents
     *
     * @param where the query matching Documents to delete
     */
    public async deleteMany(where: NonNullable<APIQuery['where']>): Promise<{ deleted: number }> {
        // add { readonly: false } to the query to prevent deletes on readonly Documents
        const deleted = await this.model.deleteMany(Object.assign({ readonly: false }, where));

        return {
            deleted: deleted.deletedCount ?? deleted.n ?? 0
        };
    }

    /**
     * Check incoming data for document updates to see if it contains values for keys not whitelisted in `readonlyOverrides` for a `readonly` Document
     *
     * Allows us to prevent overwrites to documents which are marked as readonly, while allowing overwrites to specifically-whitelisted fields
     *
     * @param doc the document that may be updated
     * @param data the incoming data to check
     *
     * @returns an error string if conflicts are found, or null if not
     */
    private readonlyConflicts(doc: TModel['read'], data: DeepPartial<TModel['write']>): string | null {
        const readonlyConflicts = doc.readonly && Object.keys(data).filter((key) => !doc.readonlyOverrides.includes(key));

        if (readonlyConflicts && readonlyConflicts.length) {
            return `Attempted to overwrite readonly fields ${JSON.stringify(readonlyConflicts)}`
        }

        return null;
    }
}
