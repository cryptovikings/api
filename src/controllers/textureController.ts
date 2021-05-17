import { Request } from 'express';
import { APIResponse } from '../models/utils/apiResponse.model';
import { AbstractController } from './abstract/abstract.controller';
import { ImageHelper } from '../helpers/image.helper';
import { HttpSuccessCode } from '../enums/httpSuccessCode.enum';
import { ErrorHelper } from '../helpers/error.helper';
import { HttpErrorCode } from '../enums/httpErrorCode.enum';
import { vikingService } from '../services/viking.service';

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
        const fileName = req.params.fileName;
        const vikingNumber = /_([0-9]+)\./.exec(fileName)?.[1];

        if (vikingNumber === undefined) {
            throw ErrorHelper.createError(HttpErrorCode.BAD_REQUEST, `Failed to retrieve texture file : Filename ${fileName} is not valid`);
        }

        if (!(await vikingService.count({number: vikingNumber}))) {
            throw ErrorHelper.createError(HttpErrorCode.NOT_FOUND, `Failed to retreieve texture file : Viking #${vikingNumber} does not exist`);
        }

        const texturePath = await ImageHelper.getTextureImage(fileName).catch((err) => {
            throw ErrorHelper.createError(HttpErrorCode.INTERNAL_SERVER_ERROR, err);
        });

        return {
            status: HttpSuccessCode.OK,
            data: texturePath,
            isFile: true
        };
    }
}

export const textureController = new TextureController();
