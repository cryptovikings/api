import { Router } from 'express';
import { testController } from '../controllers/test.controller';

/** The Router handling the /test route collection */
const testRouter = Router();

// POST /generate => (MetadataController).generate()
testRouter.post('/image', testController.bindRequestHandler(testController.makeImage));

export { testRouter };
