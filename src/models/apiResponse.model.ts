import { HttpSuccessCode } from '../enums/httpSuccessCode.enum';

/**
 * Utility interface representing the API Response format for all Controller methods, specifying a Status Code and some data
 */
export interface APIResponse<T> {
    status: HttpSuccessCode;
    data: T;
    paginate?: {
        total: number;
        count: number;
        page: number;
        pages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
