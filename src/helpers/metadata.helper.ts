import { ItemCondition, VikingMetadata } from '../models/vikingMetadata.model';
import { VikingContractData } from '../models/vikingContractData.model';
import { AssetSpecs } from '../models/assetSpec.model';
import { ImageHelper } from './image.helper';

/**
 * The MetadataHelper, implementing the actual metadata generation functionality, including Type/Style name resolution and ItemCondition
 *   mappings
 */
export class MetadataHelper {

    public static resolveAssetSpecs(viking: VikingContractData): AssetSpecs {
        const appearance = viking.appearance.toString(10);

        // TODO beard is special - it can't be below 10. Others can be 0
        const beardSelector = parseInt(appearance.slice(0, 1), 10);
        const bodySelector = parseInt(appearance.slice(2, 3), 10);
        const faceSelector = parseInt(appearance.slice(4, 5), 10);
        const topSelector = parseInt(appearance.slice(6, 7), 10);

        return {
            names: {
                viking: viking.name,
                beard: MetadataHelper.resolveBeardType(beardSelector),
                body: MetadataHelper.resolveBodyType(bodySelector),
                boots: MetadataHelper.resolveBootsType(viking.boots),
                bottoms: MetadataHelper.resolveBottomsType(viking.bottoms),
                face: MetadataHelper.resolveFaceType(faceSelector),
                helmet: MetadataHelper.resolveHelmetType(viking.helmet),
                shield: MetadataHelper.resolveShieldType(viking.shield),
                top: MetadataHelper.resolveTopType(topSelector),
                weapon: MetadataHelper.resolveWeaponType(viking.weapon)
            },
            conditions: {
                boots: MetadataHelper.resolveItemCondition(viking.speed),
                bottoms: MetadataHelper.resolveItemCondition(viking.stamina),
                helmet: MetadataHelper.resolveItemCondition(viking.intelligence),
                shield: MetadataHelper.resolveItemCondition(viking.defence),
                weapon: MetadataHelper.resolveItemCondition(viking.attack)
            }
        };
    }

    /**
     * Generate a Viking Metadata structure based on a given Viking Contract Data structure
     *
     * @param viking the Viking Contract Data
     *
     * @returns the Viking Metadata
     */
    public static async generateMetadata(viking: VikingContractData): Promise<VikingMetadata> {
        const assetSpecs = MetadataHelper.resolveAssetSpecs(viking);

        const imagePath = await ImageHelper.composeImage(assetSpecs);

        return {
            name: viking.name,
            description: 'A unique and special Viking!',
            external_link: '<link_to_viking_on_our_website>',
            image: imagePath,
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
                    value: assetSpecs.names.beard
                },
                // body traits
                {
                    trait_type: 'Body',
                    value: assetSpecs.names.body
                },
                // face traits
                {
                    trait_type: 'Face',
                    value: assetSpecs.names.face
                },
                // top traits
                {
                    trait_type: 'Top',
                    value: assetSpecs.names.top
                },

                // boots traits
                {
                    trait_type: 'Boots Type',
                    value: assetSpecs.names.boots
                },
                {
                    trait_type: 'Boots Condition',
                    value: assetSpecs.conditions.boots
                },
                {
                    trait_type: 'Speed',
                    value: viking.speed,
                    max_value: 99
                },

                // bottoms traits
                {
                    trait_type: 'Bottoms Type',
                    value: assetSpecs.names.bottoms
                },
                {
                    trait_type: 'Bottoms Condition',
                    value: assetSpecs.conditions.bottoms
                },
                {
                    trait_type: 'Stamina',
                    value: viking.stamina,
                    max_value: 99
                },

                // helmet traits
                {
                    trait_type: 'Helmet Type',
                    value: assetSpecs.names.helmet
                },
                {
                    trait_type: 'Helmet Condition',
                    value: assetSpecs.conditions.helmet
                },
                {
                    trait_type: 'Intelligence',
                    value: viking.intelligence,
                    max_value: 99
                },

                // shield traits
                {
                    trait_type: 'Shield Type',
                    value: assetSpecs.names.shield
                },
                {
                    trait_type: 'Shield Condition',
                    value: assetSpecs.conditions.shield
                },
                {
                    trait_type: 'Defence',
                    value: viking.defence,
                    max_value: 99
                },

                // weapon traits
                {
                    trait_type: 'Weapon Type',
                    value: assetSpecs.names.weapon
                },
                {
                    trait_type: 'Weapon Condition',
                    value: assetSpecs.conditions.weapon
                },
                {
                    trait_type: 'Attack',
                    value: viking.attack,
                    max_value: 99
                }
            ]
        };
    }

    /**
     * Resolve the name of a Beard Type selected by a number in the range 0-99 by the Viking Contract Data
     *
     * @param selector the numerical Beard Type value
     *
     * @returns the name of the Beard Type
     */
    private static resolveBeardType(selector: number): string {
        if (selector <= 19) {
            return '01';
        }
        else if (selector <= 39) {
            return '02';
        }
        else if (selector <= 59) {
            return '03';
        }
        else if (selector <= 79) {
            return '04';
        }
        else {
            return '05';
        }
    }

    /**
     * Resolve the name of a Body Type selected by a number in the range 0-99 by the Viking Contract Data
     *
     * @param selector the numerical Body Type value
     *
     * @returns the name of the Body Type
     */
    private static resolveBodyType(selector: number): string {
        if (selector <= 19) {
            return 'Devil';
        }
        else if (selector <= 39) {
            return 'Pink';
        }
        else if (selector <= 59) {
            return 'Robot';
        }
        else if (selector <= 79) {
            return 'White';
        }
        else {
            return 'Zombie';
        }
    }

    /**
     * Resolve the name of a Boots Type selected by a number in the range 0-99 by the Viking Contract Data
     *
     * @param selector the numerical Boots Type value
     *
     * @returns the name of the Boots Type
     */
    private static resolveBootsType(selector: number): string {
        if (selector <= 32) {
            return 'Blue';
        }
        else if (selector <= 65) {
            return 'Green';
        }
        else {
            return 'Red';
        }
    }

    /**
     * Resolve the name of a Bottoms Type selected by a number in the range 0-99 by the Viking Contract Data
     *
     * @param selector the numerical Bottoms Type value
     *
     * @returns the name of the Bottoms Type
     */
    private static resolveBottomsType(selector: number): string {
        if (selector <= 32) {
            return 'Blue';
        }
        else if (selector <= 65) {
            return 'Green';
        }
        else {
            return 'Red';
        }
    }

    /**
     * Resolve the name of a Face Type selected by a number in the range 0-99 by the Viking Contract Data
     *
     * @param selector the numerical Face Type value
     *
     * @returns the name of the Face Type
     */
    private static resolveFaceType(selector: number): string {
        if (selector <= 19) {
            return '01';
        }
        else if (selector <= 39) {
            return '02';
        }
        else if (selector <= 59) {
            return '03';
        }
        else if (selector <= 79) {
            return '04';
        }
        else {
            return '05';
        }
    }

    /**
     * Resolve the name of a Helmet Type selected by a number in the range 0-99 by the Viking Contract Data
     *
     * @param selector the numerical Helmet Type value
     *
     * @returns the name of the Helmet Type
     */
    private static resolveHelmetType(selector: number): string {
        if (selector <= 32) {
            return 'Green Horned';
        }
        else if (selector <= 65) {
            return 'Green';
        }
        else {
            return 'Red Horned';
        }
    }

    /**
    * Resolve the name of a Shield Type selected by a number in the range 0-99 by the Viking Contract Data
    *
    * @param selector the numerical Shield Type value
    *
    * @returns the name of the Shield Type
    */
    private static resolveShieldType(selector: number): string {
        return 'Circle';
    }


    /**
     * Resolve the name of a Top Type selected by a number in the range 0-99 by the Viking Contract Data
     *
     * @param selector the numerical Top Type value
     *
     * @returns the name of the Top Type
     */
    private static resolveTopType(selector: number): string {
        return 'Shirt';
    }

    /**
     * Resolve the name of a Weapon Type selected by a number in the range 0-99 by the Viking Contract Data
     *
     * @param selector the numerical Weapon Type value
     *
     * @returns the name of the Weapon Type
     */
    private static resolveWeaponType(selector: number): string {
        return 'Axe';
    }

    /**
     * Resolve the name of an Item's Condition selected by a number in the range 0-99 by the Viking Contract Data
     *
     * The statistic associated with an Item (eg, Weapon => Attack) determines the Condition
     *
     * @param statistic the numerical Statistic value
     *
     * @returns the name of the Condition for the associated Item
     */
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
