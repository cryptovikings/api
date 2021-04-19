/**
 * Enum specifying all valid HTTP status codes indicating success
 */
export enum HttpSuccessCode {
    /** Generic success response; for GET requests the payload will be the resource; for POSTs the payload will describe the operation */
    OK = 200,

    /** Success response indicating that a new resource was created; the payload will be that new resource */
    CREATED = 201,

    /** Redirect required; the response will include where to go in its headers */
    FOUND = 302
}
