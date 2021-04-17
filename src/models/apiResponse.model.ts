/**
 * Utility base Model representing the common return type for all Controller route processors
 *
 * Just a regular ol' Object, named for convenience and clarity in Controller authorship
 */

import { ModelSchema } from 'models/mongoose/base.model';
import { HttpSuccessCode } from 'utils/httpcodes';

export interface APIResponse<TSchema extends ModelSchema> {
    status: HttpSuccessCode;
    data: TSchema;
}
