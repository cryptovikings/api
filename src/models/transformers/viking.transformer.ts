import _pick from 'lodash.pick';
import { Select } from '../apiQuery.model';
import { VikingBroadcast, VikingRead } from '../mongoose/viking.model';
import { ModelTransformer } from './modelTransformer';

class VikingTransformer extends ModelTransformer<VikingRead, VikingBroadcast> {

    public convertForBroadcast(data: VikingRead, select: Select): DeepPartial<VikingBroadcast> {
        let keys = [
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

        const broadcast: VikingBroadcast = {
            name: data.name,
            image: data.image,
            description: data.description,
            external_link: `https://cryptovikings.io/viking/${data.number}`,

            attributes: [
                // birthday
                {
                    display_type: 'date',
                    trait_type: 'Birthday',
                    value: data.birthday,
                },

                // beard appearance
                {
                    trait_type: 'Beard',
                    value: data.beard_name,
                },
                // body appearance
                {
                    trait_type: 'Body',
                    value: data.body_name,
                },
                // face appearance
                {
                    trait_type: 'Face',
                    value: data.face_name,
                },
                // top appearance
                {
                    trait_type: 'Top',
                    value: data.top_name,
                },

                // Boots appearance
                {
                    trait_type: 'Boots Type',
                    value: data.boots_name,
                },
                // Boots condition
                {
                    trait_type: 'Boots Condition',
                    value: data.boots_condition
                },
                // speed statistic
                {
                    trait_type: 'Speed',
                    value: data.speed,
                    max_value: 99
                },

                // Bottoms appearance
                {
                    trait_type: 'Bottoms Type',
                    value: data.bottoms_name,
                },
                // Bottoms condition
                {
                    trait_type: 'Bottoms Condition',
                    value: data.bottoms_condition
                },
                // stamina statistic
                {
                    trait_type: 'Stamina',
                    value: data.stamina,
                    max_value: 99
                },

                // Helmet appearance
                {
                    trait_type: 'Helmet Type',
                    value: data.helmet_name,
                },
                // Helmet condition
                {
                    trait_type: 'Helmet Condition',
                    value: data.helmet_condition
                },
                // intelligence statistic
                {
                    trait_type: 'Intelligence',
                    value: data.intelligence,
                    max_value: 99
                },

                // Shield appearance
                {
                    trait_type: 'Shield Type',
                    value: data.shield_name,
                },
                // Shield condition
                {
                    trait_type: 'Shield Condition',
                    value: data.shield_condition
                },
                // defence statistic
                {
                    trait_type: 'Defence',
                    value: data.defence,
                    max_value: 99
                },


                // Weapon appearance
                {
                    trait_type: 'Weapon Type',
                    value: data.weapon_name,
                },
                // Weapon condition
                {
                    trait_type: 'Weapon Condition',
                    value: data.weapon_condition
                },
                // attack statistic
                {
                    trait_type: 'Attack',
                    value: data.attack,
                    max_value: 99
                }
            ]
        }

        return _pick(broadcast, keys);
    }
}

// export a singleton of the VikingTransformer
export const vikingTransformer = new VikingTransformer();
