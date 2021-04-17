import { Request } from 'express';
import { APIResponse } from 'models/apiResponse.model';
import { ModelSchema, ModelDocument } from 'models/base.model';
import { AbstractService } from '../services/abstract.service';
import { AbstractController } from './abstract.controller';

export abstract class AbstractResourceController<TSchema extends ModelSchema, TDocument extends ModelDocument> extends AbstractController {

    constructor(protected service: AbstractService<TSchema, TDocument>) {
        super();
    }

    public async get(req: Request): Promise<APIResponse> {
        return await this.service.get();
    }

    public async create(req: Request): Promise<APIResponse> {
        return await this.service.create(req.body as unknown as TSchema);
    }
}
