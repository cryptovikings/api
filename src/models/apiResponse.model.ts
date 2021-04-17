import { HttpSuccessCode } from '../utils/httpSuccessCode.enum';
import { ModelSchema } from './mongoose/base.model';

/**
 * Utility base Model representing the common return type for all Controller route processors
 *
 * Just a regular ol' Object, named for convenience and clarity in Controller authorship
 */
export interface APIResponse<TSchema extends ModelSchema> {
    status: HttpSuccessCode;
    data: TSchema;
}
