import { NextFunction, Request, Response } from 'express';
import { APIError } from '../models/utils/apiError.model';
import { HttpErrorCode } from '../enums/httpErrorCode.enum';

/**
 * Error Handling middleware for the Application
 */
export const error = (err: Error | APIError, req: Request, res: Response, next: NextFunction): void => {
    switch (err.name) {
        case 'APIError':
            // comes from API code
            res.status((err as APIError).statusCode).json({ data: { message: err.message } });
            break;

        case 'ValidationError':
            // comes from mongoose-beautiful-unique-validation
            res.status(HttpErrorCode.UNPROCESSABLE_ENTITY).json({ data: { message: `Unique key validation failed: ${err.message}` } });
            break;

        default:
            res.status(HttpErrorCode.INTERNAL_SERVER_ERROR).json({ data: { message: err.message } });
    }
};
