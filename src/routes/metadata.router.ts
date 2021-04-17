import { Router } from 'express';
import { metadataController } from '../controllers/metadata.controller';

/** The Router handling the /metadata route collection */
const metadataRouter = Router();

// POST /generate => (MetadataController).generate()
metadataRouter.post('/generate', metadataController.bindRequestHandler(metadataController.generate));

metadataRouter.get('/', metadataController.bindRequestHandler(metadataController.get));

export { metadataRouter };
