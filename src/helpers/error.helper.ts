import { APIError } from '../models/apiError.model';
import { HttpErrorCode } from '../utils/httpErrorCode.enum';

export class ErrorHelper {

    public static createError(code: HttpErrorCode, message: string): APIError {
        const error = new Error(message) as APIError;

        error.name = 'APIError';
        error.statusCode = code;

        return error;
    }
}
