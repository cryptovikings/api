import { Model } from 'mongoose';
import { ModelRead, ModelWrite } from '../models/mongoose/base.model';

export abstract class AbstractService<TWrite extends ModelWrite, TRead extends ModelRead> {

    constructor(public model: Model<TRead>) { }

    public async get(): Promise<Array<TRead>> {
        return await this.model.find();
    }

    public async create(data: TWrite): Promise<TRead> {
        return await this.model.create(data);
    }
}
