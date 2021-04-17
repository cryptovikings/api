import { Request } from 'express';
import { MetadataHelper } from '../helpers/metadata.helper';
import { APIResponse } from '../models/apiResponse.model';
import { VikingMetadataDocument, VikingMetadataSchema } from '../models/vikingMetadata.model';
import { metadataService } from '../services/metadata.service';
import { AbstractResourceController } from './abstractResource.controller';

/**
 * The MetadataController, designed to handle the /metadata route collection
 *
 * Implements Metadata generation + retrieval functionality, setting up the OpenSea Viking representations
 */
class MetadataController extends AbstractResourceController<VikingMetadataSchema, VikingMetadataDocument> {

    constructor() {
        super(metadataService);
    }

    /**
     * Generate Viking Metadata based on Viking Contract Data passed in through `req.body`
     *
     * @param req the Express Request
     *
     * @returns the generated Metadata
     */
    public async generate(req: Request): Promise<APIResponse> {
        // TODO validate req.body as a VikingContractData

        const data = await MetadataHelper.generateMetadata(req.body);

        return await this.service.create(data);
    }
}

/** Export a singleton of the MetadataController so that we can reference its instance methods in Router configuration */
export const metadataController = new MetadataController();
