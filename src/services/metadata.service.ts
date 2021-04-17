import { VikingMetadataDocument, VikingMetaDataModel, VikingMetadataSchema } from '../models/vikingMetadata.model';
import { AbstractService } from './abstract.service';

class MetadataService extends AbstractService<VikingMetadataSchema, VikingMetadataDocument> {

    constructor() {
        super(VikingMetaDataModel);
    }
}

export const metadataService = new MetadataService();
