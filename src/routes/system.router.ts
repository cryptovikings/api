import { Request, Response, Router } from 'express';
import { metadataRouter } from './metadata.router';
import { leaderboardRouter } from './leaderboard.router';

// system Router
const router = Router();

router.use('/metadata', metadataRouter);

router.use('/leaderboards', leaderboardRouter);

// fallback route
router.use('*', (req: Request, res: Response): void => {
    res.status(404).json({ message: 'Endpoint Not Found' });
});

export { router as systemRouter };
