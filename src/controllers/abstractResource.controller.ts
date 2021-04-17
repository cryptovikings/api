import { Request } from 'express';
import { APIResponse } from '../models/apiResponse.model';
import { ModelWrite, ModelRead } from '../models/mongoose/base.model';
import { AbstractService } from '../services/abstract.service';
import { HttpSuccessCode } from '../utils/httpSuccessCode.enum';
import { AbstractController } from './abstract.controller';

export abstract class AbstractResourceController<TWrite extends ModelWrite, TRead extends ModelRead> extends AbstractController {

    constructor(protected service: AbstractService<TWrite, TRead>) {
        super();
    }

    public async get(req: Request): Promise<APIResponse<Array<TRead>>> {
        const data = await this.service.get();

        return {
            status: HttpSuccessCode.OK,
            data
        };
    }

    public async create(req: Request): Promise<APIResponse<TRead>> {
        const data = await this.service.create(req.body);

        return {
            status: HttpSuccessCode.CREATED,
            data
        };
    }
}
