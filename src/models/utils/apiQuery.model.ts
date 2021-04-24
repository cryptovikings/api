import { FilterQuery, PaginateOptions } from 'mongoose';

/**
 * Utility interface representing the API Query format for Entity lookups
 */
export interface APIQuery {
    /** Mongo Query Object */
    where?: FilterQuery<any>;
    /** Mongo Projection set (inclusive or exclusive) */
    select?: Array<string>;
    /** Mongo Sort set */
    sort?: Array<string>;
    /** Pagination options */
    paginate?: PaginateOptions;
}
