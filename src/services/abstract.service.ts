import { Model } from 'mongoose';
import { ModelDocument, ModelSchema } from '../models/mongoose/base.model';

export abstract class AbstractService<TSchema extends ModelSchema, TDocument extends ModelDocument> {

    constructor(public model: Model<TDocument>) { }

    public async get(): Promise<Array<TDocument>> {
        return await this.model.find();
    }

    public async create(data: TSchema): Promise<TDocument> {
        return await this.model.create(data);
    }
}
