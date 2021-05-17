import { Request } from 'express';
import { APIResponse } from '../models/utils/apiResponse.model';
import { AbstractController } from './abstract/abstract.controller';
import { ImageHelper } from '../helpers/image.helper';
import { HttpSuccessCode } from '../enums/httpSuccessCode.enum';
import { ErrorHelper } from '../helpers/error.helper';
import { HttpErrorCode } from '../enums/httpErrorCode.enum';
import { vikingService } from '../services/viking.service';

/**
 * The TextureController, designed to handle the /texture route collection
 *
 * Implements a Texture Image retrieval routine, including transparent on-demand generation
 *
 * Rationale: Texture Images are not a necessary product of Viking generations; they may never be requested for a given Viking. As such, it's
 *   inefficient for storage + processing to generate them "inline" with Viking Data and Viking Images. It's best to generate them once at the time
 *   they are first requested
 *
 * Texture-retrieving routes are handled separately from the Viking collection so as not to imply that a Texture Image is actually a sub-resource
 *   of Viking, as well as to allow it to sit alongside Viking Image retrieval as a seemingly-static-file-serving first-class resource endpoint
 */
class TextureController extends AbstractController {

    /**
     * Custom handler for the route /texture/:filename
     *
     * Do some error handling to ensure that the request is valid, and defer to the ImageHelper in generating/retrieving the file
     *
     * @param req the Express Request
     *
     * @returns an APIResponse containing the Texture Image filepath
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

/** Export a singleton of the TextureController so that we can reference its instance methods in Router configuration */
export const textureController = new TextureController();
