import { HttpSuccessCode } from '../../enums/httpSuccessCode.enum';

/**
 * Utility interface representing the API Response format for all Controller methods, specifying a Status Code and some data
 */
export interface APIResponse<T> {
    readonly status: HttpSuccessCode;
    readonly data: T;
    readonly paginate?: {
        readonly total: number;
        readonly count: number;
        readonly page: number;
        readonly pages: number;
        readonly hasNext: boolean;
        readonly hasPrev: boolean;
    };
}
