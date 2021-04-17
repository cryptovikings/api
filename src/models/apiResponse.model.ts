import { HttpSuccessCode } from '../utils/httpSuccessCode.enum';
import { ModelRead } from './mongoose/base.model';

/**
 * Utility base Model representing the common return type for all Controller route processors
 *
 * Just a regular ol' Object, named for convenience and clarity in Controller authorship
 */
export interface APIResponse<TRead extends ModelRead | Array<ModelRead>> {
    status: HttpSuccessCode;
    data: TRead;
}
