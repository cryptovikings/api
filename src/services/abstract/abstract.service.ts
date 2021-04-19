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
     * // TODO
     *
     * @returns
     */
    public async find(): Promise<Array<TRead>> {
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
    public async update(): Promise<void> {

    }

    /**
     * // TODO
     */
    public async delete(): Promise<void> {

    }
}
