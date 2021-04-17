import { Request } from 'express';
import { APIResponse } from '../models/apiResponse.model';
import { ModelSchema, ModelDocument } from '../models/base.model';
import { AbstractService } from '../services/abstract.service';
import { HttpSuccessCode } from '../utils/httpcodes';
import { AbstractController } from './abstract.controller';

export abstract class AbstractResourceController<TSchema extends ModelSchema, TDocument extends ModelDocument> extends AbstractController {

    constructor(protected service: AbstractService<TSchema, TDocument>) {
        super();
    }

    public async get(req: Request): Promise<APIResponse<Array<TSchema>>> {
        const data = await this.service.get();

        return {
            status: HttpSuccessCode.OK,
            data: data as unknown as Array<TSchema>
        };
    }

    public async create(req: Request): Promise<APIResponse<TSchema>> {
        const data = await this.service.create(req.body as unknown as TSchema);

        return {
            status: HttpSuccessCode.CREATED,
            data: data as unknown as TSchema
        };
    }
}
