import { Request } from 'express';
import { MetadataHelper } from '../helpers/metadata.helper';
import { APIResponse } from '../types/apiResponse.type';
import { AbstractController } from './abstract.controller';

class MetadataController extends AbstractController {

    public async hello(req: Request): Promise<APIResponse> {
        // quick hack while we're not actually using Promises
        await new Promise(r => r(10));

        return {
            hello: 'metadata'
        };
    }

    public async metadataTest(req: Request): Promise<APIResponse> {
        // quick hack while we're not actually using Promises
        await new Promise(r => r(10));

        // TODO validate req.body

        return MetadataHelper.generateMetadata(req.body);
    }
}

export const metadataController = new MetadataController();
