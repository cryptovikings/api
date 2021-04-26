import { NewAssetSpecs } from '../models/utils/assetSpec.model';
import { Viking } from '../models/viking/viking.model';
import { vikingService } from '../services/viking.service';

export class NewVikingHelper {

    public static async createViking(assetSpecifications: NewAssetSpecs, imageUrl: string): Promise<void> {
        await vikingService.createOne({
            number: assetSpecifications.number,
            name: `Test Viking (#${assetSpecifications.number})`,
            image: imageUrl,
            description: 'A unique and special viking',

            beard_name: assetSpecifications.names.beard,
            body_name: assetSpecifications.names.body,
            face_name: assetSpecifications.names.face,
            top_name: assetSpecifications.names.top,

            boots_name: assetSpecifications.names.boots,
            boots_condition: assetSpecifications.conditions.boots,
            speed: assetSpecifications.stats.speed,

            bottoms_name: assetSpecifications.names.bottoms,
            bottoms_condition: assetSpecifications.conditions.bottoms,
            stamina: assetSpecifications.stats.stamina,

            helmet_name: assetSpecifications.names.helmet,
            helmet_condition: assetSpecifications.conditions.helmet,
            intelligence: assetSpecifications.stats.intelligence,

            shield_name: assetSpecifications.names.shield,
            shield_condition: assetSpecifications.conditions.shield,
            defence: assetSpecifications.stats.defence,

            weapon_name: assetSpecifications.names.weapon,
            weapon_condition: assetSpecifications.conditions.weapon,
            attack: assetSpecifications.stats.attack,
        });
    }

    public static resolveMetadata(data: Viking['read']): Viking['broadcast'] {
        return {
            name: data.name,
            image: data.image,
            description: data.description,
            external_link: `${process.env.FRONT_END_URL!}/viking/${data.number}`,

            attributes: [
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
        };
    }
}
