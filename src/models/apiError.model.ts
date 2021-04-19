/**
 * Simple Error-extending interface describing an API Error, incorporating a Status Code
 */
export interface APIError extends Error {
    statusCode: number;
}
