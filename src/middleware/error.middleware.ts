import { Request, Response } from 'express';
import { APIError } from '../models/apiError.model';
import { HttpErrorCode } from '../utils/httpErrorCode.enum';

/**
 * Error Handling middleware for the Application
 *
 * // TODO not being hit for GM issues...
 */
export const error = (err: Error | APIError, req: Request, res: Response): void => {
    switch (err.name) {
        case 'APIError':
            res.status((err as APIError).statusCode).json({ data: { message: err.message } });
            break;

        default:
            res.status(HttpErrorCode.INTERNAL_SERVER_ERROR).json({ data: { message: err.message } });
    }
};
