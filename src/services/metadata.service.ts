import { VikingMetaDataModel, VikingMetadataRead, VikingMetadataWrite, } from '../models/mongoose/vikingMetadata.model';
import { AbstractService } from './abstract.service';

class MetadataService extends AbstractService<VikingMetadataWrite, VikingMetadataRead> {

    constructor() {
        super(VikingMetaDataModel);
    }
}

export const metadataService = new MetadataService();
