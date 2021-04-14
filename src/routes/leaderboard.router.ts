import { Router } from 'express';
import { leaderboardController } from '../controllers/leaderboard.controller';

const router = Router();

// GET /
router.get('/', leaderboardController.bindRequestHandler(leaderboardController.hello));

export { router as leaderboardRouter };
