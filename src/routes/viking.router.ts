import { Router } from 'express';
import { vikingController } from '../controllers/viking.controller';

/** The Router handling the /viking route collection */
const vikingRouter = Router();

/** Convenient bound-once handlers */
const boundHandlers = {
    get: vikingController.bindRequestHandler(vikingController.get)
};

/** GET / => (MetadataController.get) */
vikingRouter.get('/', boundHandlers.get);

/** GET/:number => (MetadataController.get) */
vikingRouter.get('/:vikingNumber', boundHandlers.get);

// export the configured Router
export { vikingRouter };
