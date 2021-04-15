import { NextFunction, Request, Response } from 'express';
import { APIResponse } from '../models/apiResponse.model';

/**
 * Utility type representing a properly bound request processor
 */
type BoundRequestProcessor = (req: Request, res: Response, next: NextFunction) => void;

/**
 * Abstract Controller, serving as the foundation of the API's request processing layer
 *
 * Implements the root `processRequest()` which will be the Express middleware for every route, allowing for centralised error handling,
 *   permission management, and more
 *
 * Controllers should extend this class and implement instance methods which will serve as the actual implementations of API route handlers.
 *   These should then be passed to the Router middleware in `*.routes` as, for example:
 *       `router.get('/test', testController.bindRequestHandler(testController.test));`
 *
 * The call stack for any Request then looks like this:
 *        `GET /anything => processRequest() => (AnythingController).anything()`
 */
export class AbstractController {

    /**
     * Take a Controller instance method to be used as a request handler for a given route, and return a bound `processRequest()` which
     *   takes that method as its callback, retaining the `this` for both `processRequest()` and the callback itself
     *
     * @param method the Controller instance method to use as a request processing callback
     *
     * @returns the bound request handler
     */
    public bindRequestHandler(method: (req: Request) => Promise<APIResponse>): BoundRequestProcessor {
        return this.processRequest.bind(this, method.bind(this));
    }

    /**
     * Process an API request. Serves as the actual Express middleware used in responding to all requests, taking a callback to execute
     *   representing the specific Controller instance method which implements the API's response
     *
     * By having things set up this way, we gain the ability to handle concerns associated with all request handling in this one place -
     *   this could include error handlign, permision management, and more
     *
     * @param cb the actual request handler, to be executed to serve the request
     * @param req the Express Request
     * @param res the Express Response
     * @param next the Express NextFunction
     */
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