import { FilterQuery, PaginateOptions } from 'mongoose';

/** Alias for the Where query param format */
export type Where = FilterQuery<any> | undefined;

/** Alias for the Select query param format */
export type Select = Array<string> | undefined;

/** Alias for the Sort query param format */
export type Sort = Array<string> | undefined;

/** Alias for the Paginage query param format */
export type Paginate = PaginateOptions | undefined;

/**
 * Utility interface representing the API Query format for Entity lookups
 */
export interface APIQuery {
    /** Mongo Query Object */
    where: Where;
    /** Mongo Projection set (inclusive or exclusive) */
    select: Select;
    /** Mongo Sort set */
    sort: Sort;
    /** Pagination options */
    paginate: Paginate;
}
