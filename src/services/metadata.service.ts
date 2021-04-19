import { VikingModel, VikingRead, VikingWrite } from '../models/mongoose/viking.model';
import { AbstractService } from './abstract/abstract.service';

/**
 * The MetadataService, designed to handle database interactivity for the VikingMetaDataModel
 */
class MetadataService extends AbstractService<VikingWrite, VikingRead> {

    /**
     * Constructor. Specify the Model as the VikingMetaDataModel
     */
    constructor() {
        super(VikingModel);
    }
}

/** Export a singleton of the MetadataService */
export const metadataService = new MetadataService();
