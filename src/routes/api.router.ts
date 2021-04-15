import { Request, Response, Router } from 'express';
import { metadataRouter } from './metadata.router';
import { leaderboardRouter } from './leaderboard.router';

/** The Router handling the top-level /api route collection, incorporating subordinate collection-handling Routers */
const apiRouter = Router();

// /metadata collection is handled by the metadataRouter
apiRouter.use('/metadata', metadataRouter);

// /leaderboard collection is handled by the leaderboardRouter
apiRouter.use('/leaderboard', leaderboardRouter);

// configure a fallback route clearly stating that a route was invalid
apiRouter.use('*', (req: Request, res: Response): void => {
    res.status(404).json({ message: 'Endpoint Not Found' });
});

export { apiRouter };
