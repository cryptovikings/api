import { Request } from 'express';
import { HttpSuccessCode } from '../utils/httpSuccessCode.enum';
import { MetadataHelper } from '../helpers/metadata.helper';
import { APIResponse } from '../models/apiResponse.model';
import { VikingMetadataRead, VikingMetadataWrite } from '../models/mongoose/vikingMetadata.model';
import { metadataService } from '../services/metadata.service';
import { AbstractResourceController } from './abstractResource.controller';

/**
 * The MetadataController, designed to handle the /metadata route collection
 *
 * Implements Metadata generation + retrieval functionality, setting up the OpenSea Viking representations
 */
class MetadataController extends AbstractResourceController<VikingMetadataWrite, VikingMetadataRead> {

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
    public async generate(req: Request): Promise<APIResponse<VikingMetadataRead>> {
        // TODO validate req.body as a VikingContractData

        const data = await MetadataHelper.generateMetadata(req.body);

        return {
            status: HttpSuccessCode.CREATED,
            data: await this.service.create(data)
        };
    }
}

/** Export a singleton of the MetadataController so that we can reference its instance methods in Router configuration */
export const metadataController = new MetadataController();
