import { Request } from 'express';
import { APIResponse } from '../types/apiResponse.type';
import { AbstractController } from './abstract.controller';

class LeaderboardController extends AbstractController {

    public async hello(req: Request): Promise<APIResponse> {
        // quick hack while we're not actually using Promises
        await new Promise((r) => r(10));

        return {
            hello: 'lederboard'
        };
    }
}

export const leaderboardController = new LeaderboardController();
