import { NextFunction, Request, Response } from 'express';

export const cors = (req: Request, res: Response, next: NextFunction): void => {
    // TODO: restrict origin if applicable for deployment
    res.header('Access-Control-Allow-Origin', '*');

    // TODO evaluate ongoing
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');

    // TODO evaluate ongoing
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');

    next();
};
