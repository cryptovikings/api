import { APIError } from '../models/apiError.model';
import { HttpErrorCode } from '../utils/httpErrorCode.enum';

/**
 * Error Helper, providing a consistent API for constructing an APIError, containing a Status Code for use in the Error Handling midddleware
 *
 * Used instead of just throwing errors, like:
 *      `throw ErrorHelper.createError(HttpErroCode.INTERNAL_SERVER_ERROR, 'something went wrong');`
 */
export class ErrorHelper {

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
