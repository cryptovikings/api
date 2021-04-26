/**
 * Enum specifying all valid HTTP status codes indicating failure
 */
export enum HttpErrorCode {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    UNPROCESSABLE_ENTITY = 422,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501
}
