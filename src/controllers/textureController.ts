import { Request } from 'express';
import { APIResponse } from '../models/utils/apiResponse.model';
import { AbstractController } from './abstract/abstract.controller';
import { ImageHelper } from '../helpers/image.helper';
import { HttpSuccessCode } from '../enums/httpSuccessCode.enum';

/**
 * // TODO
 */
class TextureController extends AbstractController {

    /**
     * // TODO
     *
     * @param req
     * @returns
     */
    public async retrieveTextureImage(req: Request): Promise<APIResponse<string>> {
        // TODO error handling for:
        //   - viking not found in DB
        //   - viking image not found in VIKING_OUT

        return {
            status: HttpSuccessCode.OK,
            data: await ImageHelper.getTextureImage(req.params.fileName),
            isFile: true
        };
    }
}

export const textureController = new TextureController();
