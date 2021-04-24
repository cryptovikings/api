import { APIError } from '../models/utils/apiError.model';
import { HttpErrorCode } from '../enums/httpErrorCode.enum';

/**
 * Error Helper, providing a consistent API for constructing an APIError, containing a Status Code for use in the Error Handling midddleware
 *
 * Used instead of just throwing errors, like:
 *      `throw ErrorHelper.createError(HttpErroCode.INTERNAL_SERVER_ERROR, 'something went wrong');`
 */
export class ErrorHelper {

    /**
     * List of prefab errors + error factories for shorthand throwing throughout the API
     */
    public static errors = {
        notImplemented: ErrorHelper.createError(HttpErrorCode.NOT_IMPLEMENTED, 'Method not implemented'),
        emptyBody: ErrorHelper.createError(HttpErrorCode.BAD_REQUEST, 'No data provided in Request Body'),
        forbidden: (message: string): APIError => ErrorHelper.createError(HttpErrorCode.FORBIDDEN, message),
        badRequest: (message: string): APIError => ErrorHelper.createError(HttpErrorCode.BAD_REQUEST, message),
        notFound: (message: string): APIError => ErrorHelper.createError(HttpErrorCode.NOT_FOUND, message),
        validation: (message: string): APIError => ErrorHelper.createError(HttpErrorCode.UNPROCESSABLE_ENTITY, message)
    }

    /**
     * Create and return an APIError with a given Status Code and Message
     *
     * @param code the HttpErrorCode
     * @param message the message
     *
     * @returns an APIError for throwing
     */
    public static createError(code: HttpErrorCode, message: string): APIError {
        const error = new Error(message) as APIError;

        error.name = 'APIError';
        error.statusCode = code;

        return error;
    }
}
