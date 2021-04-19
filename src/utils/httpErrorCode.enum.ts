/**
 * Enum specifying all valid HTTP status codes indicating failure
 */
export enum HttpErrorCode {
    /** Error response - the server cannot process the request due to a malformed payload or otherwise invalid request */
    BAD_REQUEST = 400,

    /** Error response - the requester is not authenticated but has attempted a guarded operation */
    UNAUTHORIZED = 401,

    /** Error response - the requester is authenticated for a guarded operation, but does not have the specific permission required */
    FORBIDDEN = 403,

    /** Error response - the requested resource could not be found at this time */
    NOT_FOUND = 404,

    /** Error response - The request was well-formed but was unable to be followed due to semantic errors */
    UNPROCESSABLE_ENTITY = 422,

    /** Generic fatal error response - something critical occurred that prevented completion of the request */
    INTERNAL_SERVER_ERROR = 500,

    /** Fatal error response - the request cannot be fulfilled specifically because the method/routine is not yet implemented */
    NOT_IMPLEMENTED = 501
}
