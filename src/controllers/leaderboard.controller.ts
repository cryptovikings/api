import { Request } from 'express';
import { APIResponse } from '../models/apiResponse.model';
import { AbstractController } from './abstract.controller';

/**
 * The LeaderboardController, designed to handle the /leaderboard route collection
 *
 * Implements Leaderboard management + retrieval functionality
 */
class LeaderboardController extends AbstractController {

    /**
     * // TODO Temporary method for proof of concept
     *
     * @param req the Express Request
     *
     * @returns a nominal test object
     */
    public async hello(req: Request): Promise<APIResponse> {
        // quick hack while we're not actually using Promises
        await new Promise((r) => r(10));

        return {
            hello: 'lederboard'
        };
    }
}

/** Export a singleton of the LeaderboardController so that we can reference its instance methods in Router configuration */
export const leaderboardController = new LeaderboardController();
