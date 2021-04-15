import { Router } from 'express';
import { leaderboardController } from '../controllers/leaderboard.controller';

/** The Router handling the /leaderboard route collection */
const leaderboardRouter = Router();

// GET / => (LeaderboardController).hello()
leaderboardRouter.get('/', leaderboardController.bindRequestHandler(leaderboardController.hello));

export { leaderboardRouter };
