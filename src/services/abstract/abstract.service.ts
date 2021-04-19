import { FilterQuery, PaginateOptions } from 'mongoose';
import { PaginateModel } from 'mongoose';
import { Paginate, Select, Sort, Where } from '../../models/apiQuery.model';
import { ModelRead, ModelWrite } from '../../models/mongoose/base.model';

/**
 * AbstractService, serving as the foundation of the API's database interaction layer
 *
 * Implements Database-interactive behaviours for GET, POST, PUT and DELETE for a single given Model
 *
 * One extending class should exist per Database Entity
 *
 * @typeparam TWrite the 'writeable' Model representation, to be received for create + update
 * @typeparam TRead the 'as-read' Model representation, as read from the database and returned by the Service methods
 */
export abstract class AbstractService<TWrite extends ModelWrite, TRead extends ModelRead> {

    /**
     * Constructor. Take and store the Mongoose Model to use
     *
     * @param model the Model
     */
    constructor(public model: PaginateModel<TRead>) { }

    /**
     * Find one Document with a given query, based off the Entity's unique identifier
     *
     * @param identifierQuery the query
     *
     * @returns the found Document, or null
     */
    public async findOne(identifierQuery: FilterQuery<TRead>, select: Select): Promise<TRead | null> {
        return await this.model.findOne(identifierQuery, select);
    }

    /**
     * Find all Documents
     *
     * @returns the Documents
     */
    public async findMany(where: Where, select: Select, sort: Sort, paginate: Paginate): Promise<Array<TRead>> {
        const paginateOptions: PaginateOptions = {
            collation: { locale: 'en' },
            select,
            sort: sort?.join(' ') ?? ''
        };

        if (paginate) {
            paginateOptions.page = paginate.page;
            paginateOptions.limit = paginate.limit;
        }
        else {
            paginateOptions.pagination = false;
        }

        // TODO return pagination information
        return (await this.model.paginate(where, paginateOptions)).docs;
    }

    /**
     * // TODO
     *
     * @param data
     * @returns
     */
    public async create(data: TWrite): Promise<TRead> {
        return await this.model.create(data);
    }

    /**
     * // TODO
     */
    public async update(data: TWrite): Promise<void> {
        // return await this.model.updateOne()
    }

    /**
     * // TODO
     */
    public async delete(): Promise<void> {

    }
}
