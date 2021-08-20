import { Router } from 'express';
import { testController } from '../controllers/test.controller';

/** The Router handling the /test route collection */
const testRouter = Router();

/** POST /test/atlas/:maxVikings => (TestController).makeAtlas */
testRouter.post('/atlas/:maxVikings', testController.bindRequestHandler(testController.makeAtlas));

/** POST /test/make:count => (TestController).makeVikings */
testRouter.post('/make/:count', testController.bindRequestHandler(testController.makeVikings));

/** POST /test/reset => (TestController).reset */
testRouter.post('/reset', testController.bindRequestHandler(testController.reset));

/** GET /test/stats => (TestController).statistics */
testRouter.get('/stats', testController.bindRequestHandler(testController.statistics));

// export the configured Router
export { testRouter };
