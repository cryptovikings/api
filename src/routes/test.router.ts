import { Router } from 'express';
import { testController } from '../controllers/test.controller';

/** The Router handling the /test route collection */
const testRouter = Router();

testRouter.post('/make/:count', testController.bindRequestHandler(testController.makeVikings));

testRouter.post('/reset', testController.bindRequestHandler(testController.reset));

testRouter.get('/stats', testController.bindRequestHandler(testController.statistics));

export { testRouter };
