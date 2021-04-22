import express, { Request, Response, Router } from 'express';
import { vikingRouter } from './viking.router';
import { testRouter } from './test.router';

/** The Router handling the top-level /api route collection, incorporating subordinate collection-handling Routers */
const apiRouter = Router();

// /metadata collection is handled by the metadataRouter
apiRouter.use('/viking', vikingRouter);

// /test collection is handled by the testRouter
apiRouter.use('/test', testRouter);

// Image hosting
apiRouter.use('/static', express.static(process.env.IMAGE_OUTPUT_VIKING!));

// configure a fallback route clearly stating that a route was invalid
apiRouter.use('*', (req: Request, res: Response): void => {
    res.status(404).json({ message: 'Endpoint Not Found' });
});

export { apiRouter };
