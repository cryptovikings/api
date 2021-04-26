import { Request } from 'express';
import { HttpSuccessCode } from '../enums/httpSuccessCode.enum';
import { EthHelper } from '../helpers/eth.helper';
import { ImageHelper } from '../helpers/image.helper';
import { VikingHelper } from '../helpers/viking.helper';
import { APIResponse } from '../models/utils/apiResponse.model';
import { AbstractController } from './abstract/abstract.controller';

/**
 * The TestController, designed to handle the /test route collection
 *
 * Implements temporary response handlers for testing internal functionality
 */
class TestController extends AbstractController {
    // currently empty

    public async makeVikings(req: Request): Promise<APIResponse<boolean>> {
        for (let i = 0; i < parseInt(req.params.count, 10); i++) {
            const data = VikingHelper.generateVikingContractData();

            await EthHelper.generateViking(i, data);
        }

        await ImageHelper.composeAtlas();

        return {
            status: HttpSuccessCode.OK,
            data: true
        };
    }
}

/** Export a singleton of the TestController so that we can reference its instance methods in Router configuration */
export const testController = new TestController();
