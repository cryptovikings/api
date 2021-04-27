import path from 'path';

import { ClothesCondition } from '../enums/clothesCondition.enum';
import { ItemCondition } from '../enums/itemCondition.enum';
import { VikingSpecification } from '../models/viking/vikingSpecification.model';
import { VikingContractModel } from '../models/viking/vikingContract.model';

/**
 * VikingSpecification Helper, centralising the production of the intermediate VikingSpecification data format, based on given Viking Contract Data,
 *   used in generating Viking Database Data and in producing Viking Images
 *
 * All Contract Number => Type + Condition name mappings are contained within this class
 *
 * Separated from the VikingHelper so as to keep classes small and because the derivation of the VikingSpecification can be considered wholly separate
 *   to the subsequent production of Viking Database Data and Viking Metadata
 */
export class VikingSpecificationHelper {

    /**
     * Viking Image Parts input folder, copied over from the environment
     */
    private static readonly PARTS_ROOT = process.env.IMAGE_INPUT_ROOT!;

    /**
     * Base URI for Image URLs, using the API URL copied over from the environment
     */
    private static readonly IMAGE_BASE_URI = `${process.env.API_URL!}/static`;

    /**
     * Viking Image Parts directories, derived from the PARTS_ROOT
     */
    private static readonly directories = {
        beards: path.join(VikingSpecificationHelper.PARTS_ROOT, 'beards'),
        bodies: path.join(VikingSpecificationHelper.PARTS_ROOT, 'bodies'),
        boots: path.join(VikingSpecificationHelper.PARTS_ROOT, 'boots'),
        bottoms: path.join(VikingSpecificationHelper.PARTS_ROOT, 'bottoms'),
        faces: path.join(VikingSpecificationHelper.PARTS_ROOT, 'faces'),
        helmets: path.join(VikingSpecificationHelper.PARTS_ROOT, 'helmets'),
        shields: path.join(VikingSpecificationHelper.PARTS_ROOT, 'shields'),
        tops: path.join(VikingSpecificationHelper.PARTS_ROOT, 'tops'),
        weapons: path.join(VikingSpecificationHelper.PARTS_ROOT, 'weapons')
    };

    /**
     * Build an Image URL for a given file name
     *
     * @param fileName the name of the file
     *
     * @returns the Image URL
     */
    public static getImageUrl(fileName: string): string {
        return `${VikingSpecificationHelper.IMAGE_BASE_URI}/${fileName}.png`
    }

    /**
     * Core VikingSpecification production method. Take a Viking Number and its associated Viking Contract Data, and produce all the information
     *   necessary to generate a Viking for the database as well as a Viking Image, including:
     *       - Part Type Names
     *       - Item/Clothing Conditions
     *       - Statistics
     *       - File Paths for each Part
     *
     * Designed for use as the first step in generating a Viking based on data read from the Contract
     *
     * @param number the ID of the Viking
     * @param data the Viking Contract Data
     */
    public static buildVikingSpecification(number: number, data: VikingContractModel): VikingSpecification {
        // simple string transformer for producing file name parts by replacing spaces and hyphens with underscores
        const cleanName = (name: string): string => name.replace(/[\s-]/g, '_').toLowerCase();

        // pull out the statistic numbers from the Contract Data
        const attack = data.attack.toNumber();
        const defence = data.defence.toNumber();
        const intelligence = data.intelligence.toNumber();
        const speed = data.speed.toNumber();
        const stamina = data.stamina.toNumber();

        // resolve the boots + bottoms + helmet + sheild + weapon conditions, based on their associated statistic numbers
        const bootsCondition = VikingSpecificationHelper.resolveClothesCondition(speed);
        const bottomsCondition = VikingSpecificationHelper.resolveClothesCondition(stamina);
        const helmetCondition = VikingSpecificationHelper.resolveItemCondition(intelligence);
        const shieldCondition = VikingSpecificationHelper.resolveItemCondition(defence);
        const weaponCondition = VikingSpecificationHelper.resolveItemCondition(attack);

        // pull out 8-digit number representing beard + body + face + top generations from the Contract Data
        const appearance = data.appearance.toString();

        // resolve the beard + body + face + top type names based on 2-digit sequential slices of the appearance number
        const beardType = VikingSpecificationHelper.resolveBeardType(parseInt(appearance.slice(0, 2), 10));
        const bodyType = VikingSpecificationHelper.resolveBodyType(parseInt(appearance.slice(2, 4), 10));
        const faceType = VikingSpecificationHelper.resolveFaceType(parseInt(appearance.slice(4, 6), 10));
        const topType = VikingSpecificationHelper.resolveTopType(parseInt(appearance.slice(6, 8), 10));

        // resolve the boots + bottoms + helmet + shield + weapon type names based on their associated Contract numbers and resolved Conditions
        const bootsType = VikingSpecificationHelper.resolveBootsType(data.boots.toNumber(), bootsCondition);
        const bottomsType = VikingSpecificationHelper.resolveBottomsType(data.bottoms.toNumber(), bottomsCondition);
        const helmetType = VikingSpecificationHelper.resolveHelmetType(data.helmet.toNumber(), helmetCondition);
        const shieldType = VikingSpecificationHelper.resolveShieldType(data.shield.toNumber(), shieldCondition);
        const weaponType = VikingSpecificationHelper.resolveWeaponType(data.weapon.toNumber(), weaponCondition);

        // resolve the File Paths for the beard + body + face + top parts
        const beardFile = path.join(VikingSpecificationHelper.directories.beards, `beard_${cleanName(beardType)}.png`);
        const bodyFile = path.join(VikingSpecificationHelper.directories.bodies, `body_${cleanName(bodyType)}.png`);
        const faceFile = path.join(VikingSpecificationHelper.directories.faces, `face_${cleanName(faceType)}.png`);
        const topFile = path.join(VikingSpecificationHelper.directories.tops, `top_${cleanName(topType)}.png`);

        // resolve the Boots File Path, defaulting to the "Basic" boots asset if the statistic-based Condition wasn't good enough
        let bootsFile = path.join(VikingSpecificationHelper.directories.boots, 'boots_basic.png');
        if (bootsCondition !== ClothesCondition.BASIC) {
            const type = cleanName(bootsType);
            const condition = cleanName(bootsCondition);

            bootsFile = path.join(VikingSpecificationHelper.directories.boots, type, `boots_${type}_${condition}.png`);
        }

        // resolve the Bottoms File Path, defaulting to the "Basic" bottoms asset if the statistic-based Condition wasn't good enough
        let bottomsFile = path.join(VikingSpecificationHelper.directories.bottoms, 'bottoms_basic.png');
        if (bottomsCondition !== ClothesCondition.BASIC) {
            const type = cleanName(bottomsType);
            const condition = cleanName(bottomsCondition);

            bottomsFile = path.join(VikingSpecificationHelper.directories.bottoms, type, `bottoms_${type}_${condition}.png`);
        }

        // resolve the Helmet File Path, defaulting to undefined if the statistic-based Condition wasn't good enough
        let helmetFile = undefined;
        if (helmetCondition !== ItemCondition.NONE) {
            const type = cleanName(helmetType);
            const condition = cleanName(helmetCondition);

            helmetFile = path.join(VikingSpecificationHelper.directories.helmets, type, `helmet_${type}_${condition}.png`);
        }

        // resolve the Shield File Path, defaulting to undefined if the statistic-based Condition wasn't good enough
        let shieldFile = undefined;
        if (shieldCondition !== ItemCondition.NONE) {
            const type = cleanName(shieldType);
            const condition = cleanName(shieldCondition);

            shieldFile = path.join(VikingSpecificationHelper.directories.shields, type, `shield_${type}_${condition}.png`);
        }

        // resolve the Weapon File Path, defaulting to undefined if the statistic-based Condition wasn't good enough
        let weaponFile = undefined;
        if (weaponCondition !== ItemCondition.NONE) {
            const type = cleanName(weaponType);
            const condition = cleanName(weaponCondition);

            weaponFile = path.join(VikingSpecificationHelper.directories.weapons, type, `weapon_${type}_${condition}.png`);
        }

        // build the VikingSpecification structure for use in Viking and Image generation
        return {
            number,
            name: data.name,
            imageUrl: VikingSpecificationHelper.getImageUrl(`viking_${number}`),
            types: {
                beard: beardType,
                body: bodyType,
                face: faceType,
                top: topType,

                boots: bootsType,
                bottoms: bottomsType,

                helmet: helmetType,
                shield: shieldType,
                weapon: weaponType
            },
            stats: {
                attack,
                defence,
                intelligence,
                speed,
                stamina
            },
            conditions: {
                boots: bootsCondition,
                bottoms: bottomsCondition,

                helmet: helmetCondition,
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
     * Resolve the name of a Beard Type selected by a number in the range 10-99 by the Viking Contract Data
     *
     * Since Beard is the first component of the 8-digit Appearance, its lower limit is 10, rather than 0 as with the others
     *
     * // TODO due to the above, there's a bug right now where probabilities are not distributed evenly. Just a numbers thing
     *
     * // TODO flesh out with actual names + tune for rarity as asset lists are finalised
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
     * The second component of the 8-digit Appearance
     *
     * // TODO flesh out with actual names + tune for rarity as asset lists are finalised
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
     * The third component of the 8-digit Appearance
     *
     * // TODO flesh out with actual names + tune for rarity as asset lists are finalised
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
     * The fourth component of the 8-digit Appearance
     *
     * // TODO flesh out with actual names + tune for rarity as asset lists are finalised
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
     * Returns 'Basic' if the Boots' Condition was 'Basic', due to the associated speed statistic being too low
     *
     * // TODO flesh out with actual names + tune for rarity as asset lists are finalised
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
     * Returns 'Basic' if the Bottoms' Condition was 'Basic', due to the associated stamina statistic being too low
     *
     * // TODO flesh out with actual names + tune for rarity as asset lists are finalised
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
     * Returns 'None' if the Helmet's Condition was 'None', due to the associated intelligence statistic being too low
     *
     * // TODO flesh out with actual names + tune for rarity as asset lists are finalised
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
    * Returns 'None' if the Shield's Condition was 'None', due to the associated defence statistic being too low
    *
    * // TODO flesh out with actual names + tune for rarity as asset lists are finalised
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
     * Returns 'None' if the Weapon's Condition was 'None', due to the associated attack statistic being too low
     *
     * // TODO flesh out with actual names + tune for rarity as asset lists are finalised
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
     * The statistic associated with an Item (eg, Weapon => Attack) determines the Condition, which may nullify the item if the statistic was too low
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
     * Resolve the name of an Clothing Item's Condition selected by a number in the range 0-99 by the Viking Contract Data
     *
     * The statistic associated with a Clothing Item (eg, Boots => Speed) determines the Condition, which may replace the item with a standard/basic
     *   part if the statistic was too low
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
