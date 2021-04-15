import { Request } from 'express';
import { MetadataHelper } from '../helpers/metadata.helper';
import { APIResponse } from '../models/apiResponse.model';
import { AbstractController } from './abstract.controller';

/**
 * The MetadataController, designed to handle the /metadata route collection
 *
 * Implements Metadata generation + retrieval functionality, setting up the OpenSea Viking representations
 */
class MetadataController extends AbstractController {

    /**
     * Generate Viking Metadata based on Viking Contract Data passed in through `req.body`
     *
     * @param req the Express Request
     *
     * @returns the generated Metadata
     */
    public async generate(req: Request): Promise<APIResponse> {
        // TODO validate req.body as a VikingContractData

        return MetadataHelper.generateMetadata(req.body);
    }
}

/** Export a singleton of the MetadataController so that we can reference its instance methods in Router configuration */
export const metadataController = new MetadataController();
