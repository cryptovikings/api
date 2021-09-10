import { NextFunction, Request, Response } from 'express';

import { APIError } from '../models/utils/apiError.model';
import { HttpErrorCode } from '../enums/httpErrorCode.enum';
import { getLogger } from 'log4js';

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Error Handling middleware for the Application
 */
export const error = (err: Error | APIError, req: Request, res: Response, next: NextFunction): void => {
    const logger = getLogger('http');
    const { UNPROCESSABLE_ENTITY, INTERNAL_SERVER_ERROR } = HttpErrorCode;

    switch (err.name) {
        case 'APIError':
            // comes from API code
            logger.error(`${req.method} ${req.originalUrl} => error ${(err as APIError).statusCode} [ ${err.message} ]`);
            res.status((err as APIError).statusCode).json({ message: err.message });
            break;

        case 'ValidationError':
            // comes from mongoose-beautiful-unique-validation
            logger.error(`${req.method} ${req.originalUrl} => error ${UNPROCESSABLE_ENTITY} : [ Unique key validation failed - ${err.message} ] `);
            res.status(HttpErrorCode.UNPROCESSABLE_ENTITY).json({ message: `Unique key validation failed: ${err.message}` });
            break;

        default:
            logger.error(`${req.method} ${req.originalUrl} => error ${INTERNAL_SERVER_ERROR} : [ Unknown error - ${err.message} ]`);
            res.status(HttpErrorCode.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
};
