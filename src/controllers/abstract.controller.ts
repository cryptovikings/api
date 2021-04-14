import { NextFunction, Request, Response } from 'express';
import { APIResponse } from '../types/apiResponse.type';

type BoundRequestProcessor = (req: Request, res: Response, next: NextFunction) => void;

export class AbstractController {

    public bindRequestHandler(method: (req: Request) => Promise<APIResponse>): BoundRequestProcessor {
        return this.processRequest.bind(this, method.bind(this));
    }

    public async processRequest(
        cb: (req: Request) => Promise<APIResponse>, req: Request, res: Response, next: NextFunction
    ): Promise<void> {

        try {
            res.status(200).json(await cb(req));
        }
        catch (e) {
            // pass any errors to our Express error-handling middleware
            next(e);
        }
    }
}
