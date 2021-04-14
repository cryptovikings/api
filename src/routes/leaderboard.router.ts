import { Request, Response, Router } from 'express';

const router = Router();

// GET /
router.get('/', (req: Request, res: Response): void => {
    res.status(200).json({ hello: 'leaderboards' });
});

export { router as leaderboardRouter };
