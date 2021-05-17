import { VikingSpecification } from '../models/viking/vikingSpecification.model';
import { Viking } from '../models/viking/viking.model';
import { vikingService } from '../services/viking.service';

/**
 * VikingHelper, centralising logic for the production of Viking Database Data based on intermediate Contract-Data-based VikingSpecification, and of
 *   Viking (OpenSea) Metadata based on stored Viking Database Data
 */
export class VikingHelper {

    /**
     * Given a VikingSpecification, produce and store a Viking in the Database
     *
     * Effectively just a wrapper for (VikingService).createOne()
     *
     * @param vikingSpecification the VikingSpecification, derived from Viking Contract Data, containing the Viking information
     *
     * @returns the created Viking data
     */
    public static async createViking(vikingSpecification: VikingSpecification): Promise<Viking['read']> {
        return vikingService.createOne({
            number: vikingSpecification.number,
            name: vikingSpecification.name,
            vikingImageUrl: vikingSpecification.vikingImageUrl,
            textureImageUrl: vikingSpecification.textureImageUrl,

            description: 'A unique and special viking',

            beard_name: vikingSpecification.types.beard,
            body_name: vikingSpecification.types.body,
            face_name: vikingSpecification.types.face,
            top_name: vikingSpecification.types.top,

            boots_name: vikingSpecification.types.boots,
            boots_condition: vikingSpecification.conditions.boots,
            speed: vikingSpecification.stats.speed,

            bottoms_name: vikingSpecification.types.bottoms,
            bottoms_condition: vikingSpecification.conditions.bottoms,
            stamina: vikingSpecification.stats.stamina,

            helmet_name: vikingSpecification.types.helmet,
            helmet_condition: vikingSpecification.conditions.helmet,
            intelligence: vikingSpecification.stats.intelligence,

            shield_name: vikingSpecification.types.shield,
            shield_condition: vikingSpecification.conditions.shield,
            defence: vikingSpecification.stats.defence,

            weapon_name: vikingSpecification.types.weapon,
            weapon_condition: vikingSpecification.conditions.weapon,
            attack: vikingSpecification.stats.attack,
        });
    }

    /**
     * Given an as-stored Viking Database structure, produce the equivalent (OpenSea) Metadata
     *
     * @param data the Viking Read-format data to transform
     *
     * @returns the transformed Viking Broadcast-format data
     */
    public static resolveMetadata(data: Viking['read']): Viking['broadcast'] {
        return {
            number: data.number,
            name: data.name,
            image: data.vikingImageUrl,
            texture: data.textureImageUrl,
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
