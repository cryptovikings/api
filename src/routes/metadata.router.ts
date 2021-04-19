import { Router } from 'express';
import { metadataController } from '../controllers/metadata.controller';

/** The Router handling the /metadata route collection */
const metadataRouter = Router();

/** Convenient bound-once handlers */
const boundHandlers = {
    generate: metadataController.bindRequestHandler(metadataController.generate),
    get: metadataController.bindRequestHandler(metadataController.get)
};

// POST /generate => (MetadataController).generate()
metadataRouter.post('/generate', boundHandlers.generate);

/** GET / => (MetadataController.get) */
metadataRouter.get('/', boundHandlers.get);

/** GET/:number => (MetadataController.get) */
metadataRouter.get('/:vikingNumber', boundHandlers.get);

// export the configured Router
export { metadataRouter };
