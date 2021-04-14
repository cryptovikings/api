import { ItemCondition, Metadata } from '../types/metadata.interface';
import { Viking } from '../types/viking.interface';

export class MetadataHelper {

    public static generateMetadata(viking: Viking): Metadata {
        const appearance = viking.appearance.toString(10);

        // TODO beard is special - it cannot be blow 10. The others have a minimum value of 0
        const beardSelector = parseInt(appearance.slice(0, 1), 10);
        const bodySelector = parseInt(appearance.slice(2, 3), 10);
        const faceSelector = parseInt(appearance.slice(4, 5), 10);
        const topSelector = parseInt(appearance.slice(6, 7), 10);

        return {
            name: viking.name,
            description: 'A unique and special Viking!',
            external_link: '<link_to_viking_on_our_website>',
            image: '<ipfs_link_to_viking_image>',
            attributes: [
                // birthday
                {
                    display_type: 'date',
                    trait_type: 'Birthday',
                    value: Date.now()
                },
                // generation
                {
                    display_type: 'number',
                    trait_type: 'Generation',
                    value: 567
                },

                // body traits
                {
                    trait_type: 'Beard',
                    value: MetadataHelper.resolveBeardType(beardSelector)
                },
                // body traits
                {
                    trait_type: 'Body',
                    value: MetadataHelper.resolveBodyType(bodySelector)
                },
                // face traits
                {
                    trait_type: 'Face',
                    value: MetadataHelper.resolveFaceType(faceSelector)
                },
                // top traits
                {
                    trait_type: 'Top',
                    value: MetadataHelper.resolveTopType(topSelector)
                },

                // boots traits
                {
                    trait_type: 'Boots Type',
                    value: MetadataHelper.resolveBootsType(viking.boots)
                },
                {
                    trait_type: 'Boots Condition',
                    value: MetadataHelper.resolveItemCondition(viking.speed)
                },
                {
                    trait_type: 'Speed',
                    value: viking.speed,
                    max_value: 99
                },

                // bottoms traits
                {
                    trait_type: 'Bottoms Type',
                    value: MetadataHelper.resolveBottomsType(viking.bottoms)
                },
                {
                    trait_type: 'Bottoms Condition',
                    value: MetadataHelper.resolveItemCondition(viking.stamina)
                },
                {
                    trait_type: 'Stamina',
                    value: viking.stamina,
                    max_value: 99
                },

                // helmet traits
                {
                    trait_type: 'Helmet Type',
                    value: MetadataHelper.resolveHelmetType(viking.helmet)
                },
                {
                    trait_type: 'Helmet Condition',
                    value: MetadataHelper.resolveItemCondition(viking.intelligence)
                },
                {
                    trait_type: 'Intelligence',
                    value: viking.intelligence,
                    max_value: 99
                },

                // shield traits
                {
                    trait_type: 'Shield Type',
                    value: MetadataHelper.resolveShieldType(viking.shield)
                },
                {
                    trait_type: 'Shield Condition',
                    value: MetadataHelper.resolveItemCondition(viking.defence)
                },
                {
                    trait_type: 'Defence',
                    value: viking.defence,
                    max_value: 99
                },

                // weapon traits
                {
                    trait_type: 'Weapon Type',
                    value: MetadataHelper.resolveWeaponType(viking.weapon)
                },
                {
                    trait_type: 'Weapon Condition',
                    value: MetadataHelper.resolveItemCondition(viking.attack)
                },
                {
                    trait_type: 'Attack',
                    value: viking.attack,
                    max_value: 99
                }
            ]
        };
    }

    private static resolveBeardType(selector: number): string {
        return 'Goatee';
    }

    private static resolveBodyType(selector: number): string {
        return 'Zombie';
    }

    private static resolveFaceType(selector: number): string {
        return 'Happy';
    }

    private static resolveTopType(selector: number): string {
        return 'Shirt';
    }

    private static resolveBootsType(selector: number): string {
        return 'Shoes';
    }

    private static resolveBottomsType(selector: number): string {
        return 'Shorts';
    }

    private static resolveHelmetType(selector: number): string {
        return 'Horned Helmet';
    }

    private static resolveShieldType(selector: number): string {
        return 'Circle';
    }

    private static resolveWeaponType(selector: number): string {
        return 'Axe';
    }

    private static resolveItemCondition(statistic: number): ItemCondition {
        if (statistic <= 9) {
            return 'None';
        }
        else if (statistic <= 49) {
            return 'Broken';
        }
        else if (statistic <= 74) {
            return 'Damaged';
        }
        else if (statistic <= 89) {
            return 'Worn';
        }
        else if (statistic <= 96) {
            return 'Good';
        }
        else {
            return 'Perfect';
        }
    }
}
