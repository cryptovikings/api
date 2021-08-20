import { Request, Response, Router } from 'express';
import { vikingRouter } from './viking.router';
import { testRouter } from './test.router';

/** The Router handling the top-level /api route collection, incorporating subordinate collection-handling Routers */
const apiRouter = Router();

// /viking collection is handled by the vikingRouter
apiRouter.use('/viking', vikingRouter);

// in dev mode only, register the /test collection
if (process.env.DEV === 'true') {
    apiRouter.use('/test', testRouter);
}

// configure a fallback route clearly stating that a route was invalid
apiRouter.use('*', (req: Request, res: Response): void => {
    res.status(404).json({ message: 'Endpoint Not Found' });
});

export { apiRouter };
