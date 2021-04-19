import { VikingWrite } from '../models/mongoose/viking.model';
import { VikingContractData } from '../models/vikingContractData.model';
import { AssetSpecs } from '../models/assetSpec.model';
import { ItemCondition } from '../utils/itemCondition.enum';
import { ClothesCondition } from '../utils/clothesCondition.enum';

/**
 * The MetadataHelper, implementing the actual metadata generation functionality, including Type/Style name resolution and ItemCondition
 *   mappings
 */
export class VikingHelper {

    public static generateVikingContractData(n: number): VikingContractData {
        const random = (max: number): number => Math.round(Math.random() * (max - 1) + 1);

        const beard = random(89) + 10;
        const body = random(99);
        const face = random(99);
        const top = random(99);

        /* eslint-disable max-len */
        const appearance = `${beard.toString()}${body < 10 ? `0${body.toString()}` : body.toString()}${face < 10 ? `0${face.toString()}` : face.toString()}${top < 10 ? `0${top.toString()}` : top.toString()}`;

        return {
            name: `viking_${n}`,
            birthday: Date.now(),
            weapon: random(99),
            attack: random(99),

            shield: random(99),
            defence: random(99),

            boots: random(99),
            speed: random(99),

            helmet: random(99),
            intelligence: random(99),

            bottoms: random(99),
            stamina: random(99),

            appearance: parseInt(appearance, 10)
        };
    }

    public static resolveAssetSpecs(viking: VikingContractData): AssetSpecs {
        const appearance = viking.appearance.toString(10);

        // TODO beard is special - it can't be below 10. Others can be 0
        const beardSelector = parseInt(appearance.slice(0, 2), 10);
        const bodySelector = parseInt(appearance.slice(2, 4), 10);
        const faceSelector = parseInt(appearance.slice(4, 6), 10);
        const topSelector = parseInt(appearance.slice(6, 8), 10);

        return {
            names: {
                viking: viking.name,
                beard: VikingHelper.resolveBeardType(beardSelector),
                body: VikingHelper.resolveBodyType(bodySelector),
                boots: VikingHelper.resolveBootsType(viking.boots),
                bottoms: VikingHelper.resolveBottomsType(viking.bottoms),
                face: VikingHelper.resolveFaceType(faceSelector),
                helmet: VikingHelper.resolveHelmetType(viking.helmet),
                shield: VikingHelper.resolveShieldType(viking.shield),
                top: VikingHelper.resolveTopType(topSelector),
                weapon: VikingHelper.resolveWeaponType(viking.weapon)
            },
            conditions: {
                boots: VikingHelper.resolveClothesCondition(viking.speed),
                bottoms: VikingHelper.resolveClothesCondition(viking.stamina),
                helmet: VikingHelper.resolveItemCondition(viking.intelligence),
                shield: VikingHelper.resolveItemCondition(viking.defence),
                weapon: VikingHelper.resolveItemCondition(viking.attack)
            }
        };
    }

    public static generateVikingStorage(number: number, imagePath: string, viking: VikingContractData): VikingWrite {
        const assetSpecs = VikingHelper.resolveAssetSpecs(viking);

        return {
            number,
            name: viking.name,
            image: imagePath,
            description: 'A unique and special viking!',

            birthday: viking.birthday,

            beard_name: assetSpecs.names.beard,
            body_name: assetSpecs.names.body,
            face_name: assetSpecs.names.face,
            top_name: assetSpecs.names.top,

            boots_name: assetSpecs.names.boots,
            boots_condition: assetSpecs.conditions.boots,
            speed: viking.speed,

            bottoms_name: assetSpecs.names.bottoms,
            bottoms_condition: assetSpecs.conditions.bottoms,
            stamina: viking.stamina,

            helmet_name: assetSpecs.names.helmet,
            helmet_condition: assetSpecs.conditions.helmet,
            intelligence: viking.intelligence,

            shield_name: assetSpecs.names.shield,
            shield_condition: assetSpecs.conditions.shield,
            defence: viking.defence,

            weapon_name: assetSpecs.names.weapon,
            weapon_condition: assetSpecs.conditions.weapon,
            attack: viking.attack,
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
