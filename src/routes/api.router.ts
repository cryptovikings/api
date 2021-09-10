import { Request, Response, Router } from 'express';
import { getLogger } from 'log4js';

import { vikingRouter } from './viking.router';
import { testRouter } from './test.router';

// log4js logger
const logger = getLogger('http');

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
    const message = 'Endpoint Not Found';

    logger.error(`${req.method} ${req.originalUrl} => error 404 [ ${message} ]`);
    res.status(404).json({ message });
});

export { apiRouter };
