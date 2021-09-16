import { NextFunction, Request, Response } from 'express';

/**
 * CORS middleware for the Application
 */
export const cors = (req: Request, res: Response, next: NextFunction): void => {
    res.header('Access-Control-Allow-Origin', '*');

    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');

    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');

    next();
};
