import { VikingMetaDataModel, VikingMetadataRead, VikingMetadataWrite, } from '../models/mongoose/vikingMetadata.model';
import { AbstractService } from './abstract/abstract.service';

/**
 * The MetadataService, designed to handle database interactivity for the VikingMetaDataModel
 */
class MetadataService extends AbstractService<VikingMetadataWrite, VikingMetadataRead> {

    /**
     * Constructor. Specify the Model as the VikingMetaDataModel
     */
    constructor() {
        super(VikingMetaDataModel);
    }
}

/** Export a singleton of the MetadataService */
export const metadataService = new MetadataService();
