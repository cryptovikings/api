import _pick from 'lodash.pick';
import { VikingHelper } from '../../helpers/viking.helper';
import { Select } from '../apiQuery.model';
import { Viking } from '../mongoose/viking.model';
import { ModelTransformer } from './modelTransformer';

class VikingTransformer extends ModelTransformer<Viking> {

    public convertForBroadcast<T = DeepPartial<Viking['broadcast']> | Viking['broadcast']>(data: Viking['read'], select: Select): T {
        let keys: Array<keyof Viking['broadcast']> = [
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
