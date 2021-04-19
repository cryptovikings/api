import { FilterQuery } from 'mongoose';
import { PaginateModel } from 'mongoose';
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
    public async findOne(identifierQuery: FilterQuery<TRead>): Promise<TRead | null> {
        return await this.model.findOne(identifierQuery);
    }

    /**
     * Find all Documents
     *
     * @returns the Documents
     */
    public async findMany(): Promise<Array<TRead>> {
        return await this.model.find();
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
