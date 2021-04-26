import { Viking } from '../models/viking/viking.model';
import { VikingContractModel } from '../models/viking/vikingContract.model';
import { ItemCondition } from '../enums/itemCondition.enum';
import { ClothesCondition } from '../enums/clothesCondition.enum';
import { vikingService } from '../services/viking.service';
import { BigNumber } from '@ethersproject/bignumber';
import { AssetSpecs } from '../models/utils/assetSpec.model';

/**
 * The MetadataHelper, implementing the actual metadata generation functionality, including Type/Style name resolution and ItemCondition
 *   mappings
 *
 * // TODO
 */
export class VikingHelper {

    public static generateVikingContractData(): VikingContractModel {
        const random = (max: number): BigNumber => BigNumber.from(Math.round(Math.random() * (max - 1) + 1));

        const beard = random(89).add(10);
        const body = random(99);
        const face = random(99);
        const top = random(99);

        // eslint-disable-next-line
        const appearance = `${beard.toString()}${body.lt(10) ? `0${body.toString()}` : body.toString()}${face.lt(10) ? `0${face.toString()}` : face.toString()}${top.lt(10) ? `0${top.toString()}` : top.toString()}`;

        return {
            appearance: BigNumber.from(appearance),

            boots: random(99),
            speed: random(99),

            bottoms: random(99),
            stamina: random(99),

            helmet: random(99),
            intelligence: random(99),

            shield: random(99),
            defence: random(99),

            weapon: random(99),
            attack: random(99)
        };
    }

    public static async saveViking(storage: Viking['write']): Promise<Viking['read']> {
        return await vikingService.createOne(storage);
    }

    public static resolveAssetSpecs(viking: VikingContractModel): AssetSpecs {
        const appearance = viking.appearance.toString();

        // TODO beard is special - it can't be below 10. Others can be 0
        const beardSelector = parseInt(appearance.slice(0, 2), 10);
        const bodySelector = parseInt(appearance.slice(2, 4), 10);
        const faceSelector = parseInt(appearance.slice(4, 6), 10);
        const topSelector = parseInt(appearance.slice(6, 8), 10);

        return {
            names: {
                beard: VikingHelper.resolveBeardType(beardSelector),
                body: VikingHelper.resolveBodyType(bodySelector),
                boots: VikingHelper.resolveBootsType(viking.boots.toNumber()),
                bottoms: VikingHelper.resolveBottomsType(viking.bottoms.toNumber()),
                face: VikingHelper.resolveFaceType(faceSelector),
                helmet: VikingHelper.resolveHelmetType(viking.helmet.toNumber()),
                shield: VikingHelper.resolveShieldType(viking.shield.toNumber()),
                top: VikingHelper.resolveTopType(topSelector),
                weapon: VikingHelper.resolveWeaponType(viking.weapon.toNumber())
            },
            conditions: {
                boots: VikingHelper.resolveClothesCondition(viking.speed.toNumber()),
                bottoms: VikingHelper.resolveClothesCondition(viking.stamina.toNumber()),
                helmet: VikingHelper.resolveItemCondition(viking.intelligence.toNumber()),
                shield: VikingHelper.resolveItemCondition(viking.defence.toNumber()),
                weapon: VikingHelper.resolveItemCondition(viking.attack.toNumber())
            }
        };
    }

    public static generateVikingStorage(number: number, imageUrl: string, viking: VikingContractModel): Viking['write'] {
        const assetSpecs = VikingHelper.resolveAssetSpecs(viking);

        return {
            number,
            name: 'TEST VIKING',
            image: imageUrl,
            description: 'A unique and special viking!',

            // birthday: viking.birthday,

            beard_name: assetSpecs.names.beard,
            body_name: assetSpecs.names.body,
            face_name: assetSpecs.names.face,
            top_name: assetSpecs.names.top,

            boots_name: assetSpecs.names.boots,
            boots_condition: assetSpecs.conditions.boots,
            speed: viking.speed.toNumber(),

            bottoms_name: assetSpecs.names.bottoms,
            bottoms_condition: assetSpecs.conditions.bottoms,
            stamina: viking.stamina.toNumber(),

            helmet_name: assetSpecs.names.helmet,
            helmet_condition: assetSpecs.conditions.helmet,
            intelligence: viking.intelligence.toNumber(),

            shield_name: assetSpecs.names.shield,
            shield_condition: assetSpecs.conditions.shield,
            defence: viking.defence.toNumber(),

            weapon_name: assetSpecs.names.weapon,
            weapon_condition: assetSpecs.conditions.weapon,
            attack: viking.attack.toNumber(),
        };
    }

    public static generateVikingMetadata(data: Viking['read']): Viking['broadcast'] {
        const external_link = `${process.env.FRONT_END_URL!}/viking/${data.number}`;

        return {
            name: data.name,
            image: data.image,
            description: data.description,
            external_link,

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

    /**
     * Resolve the name of a Beard Type selected by a number in the range 0-99 by the Viking Contract Data
     *
     * // TODO beard is special - it can't be below 10
     *
     * @param selector the numerical Beard Type value
     *
     * @returns the name of the Beard Type
     */
    private static resolveBeardType(selector: number): string {
        if (selector <= 29) {
            return '01';
        }
        else if (selector <= 49) {
            return '02';
        }
        else if (selector <= 69) {
            return '03';
        }
        else if (selector <= 89) {
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
        if (selector <= 29) {
            return '01';
        }
        else if (selector <= 49) {
            return '02';
        }
        else if (selector <= 69) {
            return '03';
        }
        else if (selector <= 89) {
            return '04';
        }
        else {
            return '05';
        }
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
            return ItemCondition.NONE;
        }
        else if (statistic <= 49) {
            return ItemCondition.BROKEN;
        }
        else if (statistic <= 74) {
            return ItemCondition.DAMAGED;
        }
        else if (statistic <= 89) {
            return ItemCondition.WORN;
        }
        else if (statistic <= 96) {
            return ItemCondition.GOOD;
        }
        else {
            return ItemCondition.PERFECT;
        }
    }

    private static resolveClothesCondition(statistic: number): ClothesCondition {
        if (statistic <= 9) {
            return ClothesCondition.BASIC;
        }
        else if (statistic <= 49) {
            return ClothesCondition.RAGGED;
        }
        else if (statistic <= 74) {
            return ClothesCondition.WORN;
        }
        else if (statistic <= 89) {
            return ClothesCondition.USED;
        }
        else if (statistic <= 96) {
            return ClothesCondition.GOOD;
        }
        else {
            return ClothesCondition.PRISTINE;
        }
    }
}
