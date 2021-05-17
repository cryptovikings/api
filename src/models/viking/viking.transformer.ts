import _pick from 'lodash.pick';
import { APIQuery } from '../utils/apiQuery.model';
import { Viking } from './viking.model';
import { ModelTransformer } from '../model.transformer';
import { VikingHelper } from '../../helpers/viking.helper';

/**
 * VikingTransformer, handling the conversion of Viking Read-format data to Viking Broadcast-format data
 */
class VikingTransformer extends ModelTransformer<Viking> {

    /**
     * Upstream converter for Viking Read => Viking Broadcast, invoked by the VikingController on Viking data retrieval
     *
     * @param data the Viking Read-format data, retrieved from the database, to convert
     * @param select The Mongo Projection set, if it was provided in the GET query, enabling picking
     *
     * @returns the converted Viking Broadcast-formatted data
     *
     * @typeparam T (autoinferred) the specific return type
     */
    public convertForBroadcast<T = DeepPartial<Viking['broadcast']> | Viking['broadcast']>(data: Viking['read'], select?: APIQuery['select']): T {
        // default keys to pick from the Viking Broadcast-format data
        let keys: Array<keyof Viking['broadcast']> = [
            'name',
            'number',
            'image',
            'texture',
            'description',
            'external_link',
            'attributes'
        ];

        // handle projection by augmenting the keys to pick
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

        // return a VikingMetadata (Broadcast-format) structure with appropriate picked keys
        return _pick(VikingHelper.resolveMetadata(data), keys) as unknown as T;
    }
}

// export a singleton of the VikingTransformer
export const vikingTransformer = new VikingTransformer();
