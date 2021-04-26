import path from 'path';

import { ClothesCondition } from '../enums/clothesCondition.enum';
import { ItemCondition } from '../enums/itemCondition.enum';
import { AssetSpecs } from '../models/utils/assetSpec.model';
import { VikingContractModel } from '../models/viking/vikingContract.model';

export class AssetHelper {

    private static readonly PARTS_ROOT = process.env.IMAGE_INPUT_ROOT!;

    private static readonly directories = {
        beards: path.join(AssetHelper.PARTS_ROOT, 'beards'),
        bodies: path.join(AssetHelper.PARTS_ROOT, 'bodies'),
        boots: path.join(AssetHelper.PARTS_ROOT, 'boots'),
        bottoms: path.join(AssetHelper.PARTS_ROOT, 'bottoms'),
        faces: path.join(AssetHelper.PARTS_ROOT, 'faces'),
        helmets: path.join(AssetHelper.PARTS_ROOT, 'helmets'),
        shields: path.join(AssetHelper.PARTS_ROOT, 'shields'),
        tops: path.join(AssetHelper.PARTS_ROOT, 'tops'),
        weapons: path.join(AssetHelper.PARTS_ROOT, 'weapons')
    };

    public static buildAssetSpecifications(number: number, data: VikingContractModel): AssetSpecs {
        const cleanName = (name: string): string => name.replace(/[\s-]/g, '_').toLowerCase();

        const appearance = data.appearance.toString();

        const bootsCondition = AssetHelper.resolveClothesCondition(data.speed.toNumber());
        const bottomsCondition = AssetHelper.resolveClothesCondition(data.stamina.toNumber());
        const helmetCondition = AssetHelper.resolveItemCondition(data.intelligence.toNumber());
        const shieldCondition = AssetHelper.resolveItemCondition(data.defence.toNumber());
        const weaponCondition = AssetHelper.resolveItemCondition(data.attack.toNumber());

        const beardType = AssetHelper.resolveBeardType(parseInt(appearance.slice(0, 2), 10));
        const bodyType = AssetHelper.resolveBodyType(parseInt(appearance.slice(2, 4), 10));
        const faceType = AssetHelper.resolveFaceType(parseInt(appearance.slice(4, 6), 10));
        const topType = AssetHelper.resolveTopType(parseInt(appearance.slice(6, 8), 10));

        const bootsType = AssetHelper.resolveBootsType(data.boots.toNumber(), bootsCondition);
        const bottomsType = AssetHelper.resolveBottomsType(data.bottoms.toNumber(), bottomsCondition);
        const helmetType = AssetHelper.resolveHelmetType(data.helmet.toNumber(), helmetCondition);
        const shieldType = AssetHelper.resolveShieldType(data.shield.toNumber(), shieldCondition);
        const weaponType = AssetHelper.resolveWeaponType(data.weapon.toNumber(), weaponCondition);

        const beardFile = path.join(AssetHelper.directories.beards, `beard_${cleanName(beardType)}.png`);
        const bodyFile = path.join(AssetHelper.directories.bodies, `body_${cleanName(bodyType)}.png`);
        const faceFile = path.join(AssetHelper.directories.faces, `face_${cleanName(faceType)}.png`);
        const topFile = path.join(AssetHelper.directories.tops, `top_${cleanName(topType)}.png`);

        // TODO basic not handled?
        /* eslint-disable */
        let bootsFile = path.join(AssetHelper.directories.boots, 'boots_basic.png');
        if (bootsCondition !== ClothesCondition.BASIC) {
            const type = cleanName(bootsType);
            const condition = cleanName(bootsCondition);

            bootsFile = path.join(AssetHelper.directories.boots, type, `boots_${type}_${condition}.png`);
        }

        let bottomsFile = path.join(AssetHelper.directories.bottoms, 'bottoms_basic.png');
        if (bottomsCondition !== ClothesCondition.BASIC) {
            const type = cleanName(bottomsType);
            const condition = cleanName(bottomsCondition);

            bottomsFile = path.join(AssetHelper.directories.bottoms, type, `bottoms_${type}_${condition}.png`);
        }

        let helmetFile = undefined;
        if (helmetCondition !== ItemCondition.NONE) {
            const type = cleanName(helmetType);
            const condition = cleanName(helmetCondition);

            helmetFile = path.join(AssetHelper.directories.helmets, type, `helmet_${type}_${condition}.png`);
        }

        let shieldFile = undefined;
        if (shieldCondition !== ItemCondition.NONE) {
            const type = cleanName(shieldType);
            const condition = cleanName(shieldCondition);

            shieldFile = path.join(AssetHelper.directories.shields, type, `shield_${type}_${condition}.png`);
        }

        let weaponFile = undefined;
        if (weaponCondition !== ItemCondition.NONE) {
            const type = cleanName(weaponType);
            const condition = cleanName(weaponCondition);

            weaponFile = path.join(AssetHelper.directories.weapons, type, `weapon_${type}_${condition}.png`);
        }

        return {
            number,
            names: {
                beard: beardType,
                body: bodyType,
                face: faceType,
                top: topType,

                boots: bootsType, // TODO this should resolve to 'basic' for basic condition
                bottoms: bottomsType,

                helmet: helmetType, // TODO this should resolve to 'none' for none condition
                shield: shieldType,
                weapon: weaponType
            },
            stats: {
                attack: data.attack.toNumber(),
                defence: data.defence.toNumber(),
                intelligence: data.intelligence.toNumber(),
                speed: data.speed.toNumber(),
                stamina: data.stamina.toNumber()
            },
            conditions: {
                boots: bootsCondition, // TODO undefined for 'basic' condition?
                bottoms: bottomsCondition,

                helmet: helmetCondition, // TODO undefined for 'none' condition?
                shield: shieldCondition,
                weapon: weaponCondition
            },
            filePaths: {
                beard: beardFile,
                body: bodyFile,
                face: faceFile,
                top: topFile,
                boots: bootsFile,
                bottoms: bottomsFile,
                helmet: helmetFile,
                shield: shieldFile,
                weapon: weaponFile
            }
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

        if (selector <= 49) {
            return '02';
        }

        if (selector <= 69) {
            return '03';
        }

        if (selector <= 89) {
            return '04';
        }

        return '05';
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

        if (selector <= 39) {
            return 'Pink';
        }

        if (selector <= 59) {
            return 'Robot';
        }

        if (selector <= 79) {
            return 'White';
        }

        return 'Zombie';
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

        if (selector <= 39) {
            return '02';
        }

        if (selector <= 59) {
            return '03';
        }

        if (selector <= 79) {
            return '04';
        }

        return '05';
    }

    /**
     * Resolve the name of a Top Type selected by a number in the range 0-99 by the Viking Contract Data
     *
     * @param selector the numerical Top Type value
     *
     * @returns the name of the Top Type
     */
    private static resolveTopType(selector: number): string {
        if (selector <= 19) {
            return '01';
        }

        if (selector <= 39) {
            return '02';
        }

        if (selector <= 59) {
            return '03';
        }

        if (selector <= 79) {
            return '04';
        }

        return '05';
    }

    /**
     * Resolve the name of a Boots Type selected by a number in the range 0-99 by the Viking Contract Data
     *
     * @param selector the numerical Boots Type value
     *
     * @returns the name of the Boots Type
     */
    private static resolveBootsType(selector: number, condition: ClothesCondition): string {
        if (condition === ClothesCondition.BASIC) {
            return ClothesCondition.BASIC;
        }

        if (selector <= 32) {
            return 'Blue';
        }

        if (selector <= 65) {
            return 'Green';
        }

        return 'Red';
    }

    /**
     * Resolve the name of a Bottoms Type selected by a number in the range 0-99 by the Viking Contract Data
     *
     * @param selector the numerical Bottoms Type value
     *
     * @returns the name of the Bottoms Type
     */
    private static resolveBottomsType(selector: number, condition: ClothesCondition): string {
        if (condition === ClothesCondition.BASIC) {
            return ClothesCondition.BASIC;
        }

        if (selector <= 32) {
            return 'Blue';
        }

        if (selector <= 65) {
            return 'Green';
        }

        return 'Red';
    }

    /**
     * Resolve the name of a Helmet Type selected by a number in the range 0-99 by the Viking Contract Data
     *
     * @param selector the numerical Helmet Type value
     *
     * @returns the name of the Helmet Type
     */
    private static resolveHelmetType(selector: number, condition: ItemCondition): string {
        if (condition === ItemCondition.NONE) {
            return ItemCondition.NONE;
        }

        if (selector <= 32) {
            return 'Green Horned';
        }

        if (selector <= 65) {
            return 'Green';
        }

        return 'Red Horned';
    }

    /**
    * Resolve the name of a Shield Type selected by a number in the range 0-99 by the Viking Contract Data
    *
    * @param selector the numerical Shield Type value
    *
    * @returns the name of the Shield Type
    */
    private static resolveShieldType(selector: number, condition: ItemCondition): string {
        if (condition === ItemCondition.NONE) {
            return ItemCondition.NONE;
        }

        return 'Placeholder';
    }

    /**
     * Resolve the name of a Weapon Type selected by a number in the range 0-99 by the Viking Contract Data
     *
     * @param selector the numerical Weapon Type value
     *
     * @returns the name of the Weapon Type
     */
    private static resolveWeaponType(selector: number, condition: ItemCondition): string {
        if (condition === ItemCondition.NONE) {
            return ItemCondition.NONE;
        }

        return 'Placeholder';
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

    /**
     * Resolve the name of an Clothes' Condition selected by a number in the range 0-99 by the Viking Contract Data
     *
     * The statistic associated with a Clothe (eg, Boots => Speed) determines the Condition
     *
     * @param statistic the numerical Statistic value
     *
     * @returns the name of the Condition for the associated Clothes
     */
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
