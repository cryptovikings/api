import { HttpSuccessCode } from '../utils/httpSuccessCode.enum';

/**
 * Utility interface representing the API Response format for all Controller methods, specifying a Status Code and some data
 */
export interface APIResponse<TRead> {
    status: HttpSuccessCode;
    data: TRead;
}
