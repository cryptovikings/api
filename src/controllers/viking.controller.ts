import { APIResponse } from '../models/apiResponse.model';
import { VikingRead, VikingWrite, VikingBroadcast } from '../models/mongoose/viking.model';
import { vikingTransformer } from '../models/transformers/viking.transformer';
import { metadataService } from '../services/metadata.service';
import { AbstractResourceController } from './abstract/abstractResource.controller';

/**
 * The VikingController, designed to handle the /viking route collection and the viking metadata database Entity
 *
 * Additionally implements Metadata generation + retrieval functionality, setting up the OpenSea Viking representations
 */
class VikingController extends AbstractResourceController<VikingWrite, VikingRead, VikingBroadcast> {

    /**
     * Constructor. Specify the Service as the MetadataService
     */
    constructor() {
        super(metadataService, vikingTransformer, 'number');
    }

    /**
     * Override the abstract create() and throw a NotImplementedError, preventing accidental wiring up of (VikingController).create
     */
    public create(): Promise<APIResponse<VikingRead>> {
        throw this.errors.notImplemented;
    }

    /**
     * Override the abstract update() and throw a NotImplementedError, preventing accidental wiring up of (VikingController).update
     */
    public update(): Promise<APIResponse<VikingRead>> {
        throw this.errors.notImplemented;
    }

    /**
     * Override the abstract delete() and throw a NotImplementedError, preventing accidental wiring up of (VikingController).delete
     */
    public delete(): Promise<APIResponse<boolean>> {
        throw this.errors.notImplemented;
    }
}

/** Export a singleton of the VikingController so that we can reference its instance methods in Router configuration */
export const vikingController = new VikingController();
