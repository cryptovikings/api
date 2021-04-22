import { Router } from 'express';
import { testController } from '../controllers/test.controller';

/** The Router handling the /test route collection */
const testRouter = Router();

// testRouter.post('/many/:count', testController.bindRequestHandler(testController.makeMany));

export { testRouter };
