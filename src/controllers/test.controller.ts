import { Request } from 'express';
import { ImageHelper } from '../helpers/image.helper';
import { VikingHelper } from '../helpers/viking.helper';
import { APIResponse } from '../models/apiResponse.model';
import { vikingService } from '../services/viking.service';
import { HttpSuccessCode } from '../utils/httpSuccessCode.enum';
import { AbstractController } from './abstract/abstract.controller';

/**
 * The TestController, designed to handle the /test route collection
 *
 * Implements temporary response handlers for testing internal functionality
 */
class TestController extends AbstractController {

    public async makeMany(req: Request): Promise<APIResponse<{ filePaths: Array<string>; atlasPath: string }>> {
        const count = parseInt(req.params.count, 10);
        const filePaths = [];

        ImageHelper.clear();

        for (let i = 0; i < count; i++) {
            const contractData = VikingHelper.generateVikingContractData(i);
            const assetSpecs = VikingHelper.resolveAssetSpecs(contractData);

            const imagePath = await ImageHelper.composeImage(i, assetSpecs);

            const storage = VikingHelper.generateVikingStorage(i, imagePath, contractData);

            await vikingService.create(storage);

            filePaths.push(imagePath);
        }

        const atlasPath = await ImageHelper.composeAtlas();

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
