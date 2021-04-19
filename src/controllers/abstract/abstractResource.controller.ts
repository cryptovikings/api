import { Request } from 'express';
import { APIResponse } from '../../models/apiResponse.model';
import { ModelWrite, ModelRead } from '../../models/mongoose/base.model';
import { AbstractService } from '../../services/abstract/abstract.service';
import { HttpSuccessCode } from '../../utils/httpSuccessCode.enum';
import { AbstractController } from './abstract.controller';

/**
 * Abstract Resource Controller, serving as the foundation of the API's Entity-CRUD request processing layer
 *
 * Implements GET, POST, PUT and DELETE handlers for a single given Model, deferring database interactivity to a single Service
 *
 * Implements validation
 *
 * Controllers which serve a particular Model should extend this class
 *
 * @typeparam TWrite the 'writeable' Model representation, to be received in request bodies for create + update
 * @typeparam TRead the 'as-read' Model representation, as read from the database and broadcast in responses
 */
export abstract class AbstractResourceController<TWrite extends ModelWrite, TRead extends ModelRead> extends AbstractController {

    /**
     * Constructor. Take and store the Service to use
     *
     * @param service the Service to use
     */
    constructor(protected service: AbstractService<TWrite, TRead>) {
        super();
    }

    /**
     * // TODO
     *
     * @param req
     * @returns
     */
    public async get(req: Request): Promise<APIResponse<Array<TRead>>> {
        const data = await this.service.find();

        return {
            status: HttpSuccessCode.OK,
            data
        };
    }

    /**
     * // TODO
     *
     * @param req
     * @returns
     */
    public async create(req: Request): Promise<APIResponse<TRead>> {
        const data = await this.service.create(req.body);

        return {
            status: HttpSuccessCode.CREATED,
            data
        };
    }

    /**
     * // TODO
     *
     * @param req
     * @returns
     */
    public async update(req: Request): Promise<APIResponse<TRead>> {
        await new Promise((r) => r(true));

        return {
            status: HttpSuccessCode.OK,
            data: { _id: '23458234823' } as TRead
        }
    }

    /**
     * // TODO
     *
     * @param req
     * @returns
     */
    public async delete(req: Request): Promise<APIResponse<boolean>> {
        await new Promise((r) => r(true));

        return {
            status: HttpSuccessCode.OK,
            data: true
        };
    }
}
