import { Request } from 'express';
import { ImageHelper } from '../helpers/image.helper';
import { MetadataHelper } from '../helpers/metadata.helper';
import { APIResponse } from '../models/apiResponse.model';
import { metadataService } from '../services/metadata.service';
import { HttpSuccessCode } from '../utils/httpSuccessCode.enum';
import { AbstractController } from './abstract/abstract.controller';

/**
 * The TestController, designed to handle the /test route collection
 *
 * Implements temporary response handlers for testing internal functionality
 */
class TestController extends AbstractController {

    /**
     * Test the Image Compositor directly by performing the metadata transformation on an incoming Viking Contract Data structure and then
     *   kicking off the Compositor
     *
     * @param req the Express Request
     */
    public async makeImage(req: Request): Promise<APIResponse<string>> {
        const assetSpecs = MetadataHelper.resolveAssetSpecs(req.body);

        const filePath = await ImageHelper.composeImage(assetSpecs);

        return {
            status: HttpSuccessCode.OK,
            data: filePath
        };
    }

    public async makeAtlas(req: Request): Promise<APIResponse<string>> {
        const filePath = await ImageHelper.generateAtlas();

        return {
            status: HttpSuccessCode.OK,
            data: filePath
        };
    }

    public async makeMany(req: Request): Promise<APIResponse<{ filePaths: Array<string>; atlasPath: string }>> {
        const count = parseInt(req.params.count, 10);
        const filePaths = [];

        ImageHelper.clear();

        for (let i = 0; i < count; i++) {
            const contract = MetadataHelper.generateVikingStruct(i);

            const metadata = await MetadataHelper.generateMetadata(contract);

            await metadataService.create(metadata);

            const assetSpecs = MetadataHelper.resolveAssetSpecs(contract);

            const filePath = await ImageHelper.composeImage(assetSpecs);

            filePaths.push(filePath);
        }

        const atlasPath = await ImageHelper.generateAtlas();

        return {
            status: HttpSuccessCode.OK,
            data: {
                filePaths,
                atlasPath
            }
        };
    }
}

/** Export a singleton of the TestController so that we can reference its instance methods in Router configuration */
export const testController = new TestController();
