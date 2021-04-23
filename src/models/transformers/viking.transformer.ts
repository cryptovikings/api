import _pick from 'lodash.pick';
import { VikingHelper } from '../../helpers/viking.helper';
import { Select } from '../apiQuery.model';
import { VikingBroadcast, VikingRead } from '../mongoose/viking.model';
import { ModelTransformer } from './modelTransformer';

class VikingTransformer extends ModelTransformer<VikingRead, VikingBroadcast> {

    public convertForBroadcast<T = DeepPartial<VikingBroadcast> | VikingBroadcast>(data: VikingRead, select: Select): T {
        let keys: Array<keyof VikingBroadcast> = [
            'name',
            'image',
            'description',
            'external_link',
            'attributes'
        ];

        if (select && select.length) {
            const omitKeys = select.filter((key) => key.startsWith('-')).map((key) => key.substr(1));
            const pickKeys = select.filter((key) => !key.startsWith('-'));

            if (omitKeys.length) {
                keys = keys.filter((key) => !omitKeys.includes(key));
            }
            else if (pickKeys.length) {
                keys = keys.filter((key) => pickKeys.includes(key));
            }
        }

        return _pick(VikingHelper.generateVikingMetadata(data), keys) as unknown as T;
    }
}

// export a singleton of the VikingTransformer
export const vikingTransformer = new VikingTransformer();
