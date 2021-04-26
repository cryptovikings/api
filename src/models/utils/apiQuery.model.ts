import { FilterQuery, PaginateOptions } from 'mongoose';

/**
 * Utility interface representing the API Query format for Entity lookups
 */
export interface APIQuery {
    /** Mongo Query Object */
    readonly where?: FilterQuery<any>;
    /** Mongo Projection set (inclusive or exclusive) */
    readonly select?: Array<string>;
    /** Mongo Sort set */
    readonly sort?: Array<string>;
    /** Pagination options */
    readonly paginate?: PaginateOptions;
}
