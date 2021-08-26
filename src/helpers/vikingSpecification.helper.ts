import path from 'path';

import { ClothesCondition } from '../enums/clothesCondition.enum';
import { ItemCondition } from '../enums/itemCondition.enum';
import { VikingSpecification } from '../models/viking/vikingSpecification.model';
import { VikingContractModel } from '../models/viking/vikingContract.model';
import { Viking } from '../models/viking/viking.model';

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
    private static readonly PARTS_ROOT = path.join(__dirname, '../../', process.env.IMAGE_VIKING_INPUT_ROOT!);

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
     * Core VikingSpecification production method. Take a Viking Number and some representative data, and produce all the information necessary to
     *   generate a Viking for the database as well as a Viking Image, including:
     *       - Part Type Names
     *       - Item/Clothing Conditions
     *       - Statistics
     *       - File Paths for each Part
     *
     * Capable of building a specification off of both a Contract Viking representation as well as a Local Viking representation. This enables use
     *   both in generating Vikings + Images from Contract data in Eth Event Handling, and in generating missing Images based on stored Database Data
     *
     * @param number the ID of the Viking
     * @param data the data, in Contract or Local representations
     */
    public static buildVikingSpecification(number: number, data: VikingContractModel | Viking['read']): VikingSpecification {
        // simple string transformer for producing file name parts by replacing spaces and hyphens with underscores
        const cleanName = (name: string): string => name.replace(/[\s-]/g, '_').toLowerCase();

        // statistics
        let attack: number,
            defence: number,
            intelligence: number,
            speed: number,
            stamina: number;

        // conditions
        let bootsCondition: ClothesCondition,
            bottomsCondition: ClothesCondition,
            helmetCondition: ItemCondition,
            shieldCondition: ItemCondition,
            weaponCondition: ItemCondition;

        // part names
        let bootsType: string,
            bottomsType: string,
            helmetType: string,
            shieldType: string,
            weaponType: string,
            beardType: string,
            bodyType: string,
            faceType: string,
            topType: string;

        if (VikingSpecificationHelper.isVikingContractModel(data)) {
            // if we're building from Contract data, resolve

            attack = data.attack.toNumber();
            defence = data.defence.toNumber();
            intelligence = data.intelligence.toNumber();
            speed = data.speed.toNumber();
            stamina = data.stamina.toNumber();

            bootsCondition = VikingSpecificationHelper.resolveClothesCondition(speed);
            bottomsCondition = VikingSpecificationHelper.resolveClothesCondition(stamina);
            helmetCondition = VikingSpecificationHelper.resolveItemCondition(intelligence);
            shieldCondition = VikingSpecificationHelper.resolveItemCondition(defence);
            weaponCondition = VikingSpecificationHelper.resolveItemCondition(attack);

            bootsType = VikingSpecificationHelper.resolveBootsType(data.boots.toNumber(), bootsCondition);
            bottomsType = VikingSpecificationHelper.resolveBottomsType(data.bottoms.toNumber(), bottomsCondition);
            helmetType = VikingSpecificationHelper.resolveHelmetType(data.helmet.toNumber(), helmetCondition);
            shieldType = VikingSpecificationHelper.resolveShieldType(data.shield.toNumber(), shieldCondition);
            weaponType = VikingSpecificationHelper.resolveWeaponType(data.weapon.toNumber(), weaponCondition);

            // resolve the beard + body + face + top type names based on 2-digit sequential slices of the appearance number
            const appearance = data.appearance.toString();

            beardType = VikingSpecificationHelper.resolveBeardType(parseInt(appearance.slice(0, 2), 10));
            bodyType = VikingSpecificationHelper.resolveBodyType(parseInt(appearance.slice(2, 4), 10));
            faceType = VikingSpecificationHelper.resolveFaceType(parseInt(appearance.slice(4, 6), 10));
            topType = VikingSpecificationHelper.resolveTopType(parseInt(appearance.slice(6, 8), 10));
        }
        else {
            // if we're building from Database data, copy

            attack = data.attack;
            defence = data.defence;
            intelligence = data.intelligence;
            speed = data.speed;
            stamina = data.stamina;

            bootsCondition = data.boots_condition;
            bottomsCondition = data.bottoms_condition;
            helmetCondition = data.helmet_condition;
            shieldCondition = data.shield_condition;
            weaponCondition = data.weapon_condition;

            bootsType = data.boots_name;
            bottomsType = data.bottoms_name;
            helmetType = data.helmet_name;
            shieldType = data.shield_name;
            weaponType = data.weapon_name;

            beardType = data.beard_name;
            bodyType = data.body_name;
            faceType = data.face_name;
            topType = data.top_name;
        }

        // resolve the File Paths for the beard + body + face + top parts
        const beardFile = path.join(VikingSpecificationHelper.directories.beards, `beard_${cleanName(beardType)}.png`);
        const bodyFile = path.join(VikingSpecificationHelper.directories.bodies, `body_${cleanName(bodyType)}.png`);
        const faceFile = path.join(VikingSpecificationHelper.directories.faces, `face_${cleanName(faceType)}.png`);
        const topFile = path.join(VikingSpecificationHelper.directories.tops, `top_${cleanName(topType)}.png`);

        // resolve the Boots File Path, defaulting to the "Basic" boots asset if the statistic-based Condition wasn't good enough
        let bootsFile = path.join(VikingSpecificationHelper.directories.boots, 'boots_standard.png');
        if (bootsCondition !== ClothesCondition.STANDARD) {
            const type = cleanName(bootsType);
            const condition = cleanName(bootsCondition);

            bootsFile = path.join(VikingSpecificationHelper.directories.boots, type, `boots_${type}_${condition}.png`);
        }

        // resolve the Bottoms File Path, defaulting to the "Basic" bottoms asset if the statistic-based Condition wasn't good enough
        let bottomsFile = path.join(VikingSpecificationHelper.directories.bottoms, 'bottoms_standard.png');
        if (bottomsCondition !== ClothesCondition.STANDARD) {
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
            image: `viking_${number}`,
            texture: `viking_${number}`,
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
     * Type guard for differentiating between Viking Contract Data and Viking Database Data
     *
     * @param data the data to inspect
     *
     * @returns whether or not the data is a VikingContractModel
     */
    private static isVikingContractModel(data: VikingContractModel | Viking['read']): data is VikingContractModel {
        return !!(data as VikingContractModel).appearance;
    }

    /**
     * Resolve the name of a Beard Type selected by a number in the range 10-99 by the Viking Contract Data
     *
     * Since Beard is the first component of the 8-digit Appearance, its lower limit is 10, rather than 0 as with the others
     *
     * // TODO flesh out with actual names + tune for rarity as asset lists are finalised
     *
     * @param selector the numerical Beard Type value
     *
     * @returns the name of the Beard Type
     */
    private static resolveBeardType(selector: number): string {
        if (selector <= 27) {
            return 'Beaded';
        }

        if (selector <= 45) {
            return 'Bushy';
        }

        if (selector <= 63) {
            return 'Goatee';
        }

        if (selector <= 81) {
            return 'Sophisticated';
        }

        return 'Stubble';
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
        if (selector <= 9) {
            return 'Base 1';
        }

        if (selector <= 18) {
            return 'Base 2';
        }

        if (selector <= 27) {
            return 'Base 3';
        }

        if (selector <= 36) {
            return 'Devil';
        }

        if (selector <= 45) {
            return 'Inked';
        }

        if (selector <= 54) {
            return 'Pigman';
        }

        if (selector <= 63) {
            return 'Robot';
        }

        if (selector <= 72) {
            return 'Tatted';
        }

        if (selector <= 81) {
            return 'Wolfman';
        }

        if (selector <= 90) {
            return 'Zombie (Blue)';
        }

        return 'Zombie (Green)';
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
        if (selector <= 11) {
            return 'Angry';
        }

        if (selector <= 22) {
            return 'Cyclops';
        }

        if (selector <= 33) {
            return 'Fangs';
        }

        if (selector <= 33) {
            return 'Grin';
        }

        if (selector <= 44) {
            return 'Patch';
        }

        if (selector <= 55) {
            return 'Singer';
        }

        if (selector <= 55) {
            return 'Smirk';
        }

        if (selector <= 55) {
            return 'Stern';
        }

        return 'Worried';
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
        if (selector <= 3) {
            return 'Fitted Shirt (Blue)';
        }

        if (selector <= 7) {
            return 'Fitted Shirt (Green)';
        }

        if (selector <= 11) {
            return 'Fitted Shirt (Grey)';
        }

        if (selector <= 15) {
            return 'Fitted Shirt (Pink)';
        }

        if (selector <= 19) {
            return 'Fitted Shirt (Red)';
        }

        if (selector <= 23) {
            return 'Fitted Shirt (Yellow)';
        }

        if (selector <= 27) {
            return 'Strapped';
        }

        if (selector <= 31) {
            return 'Tank Top (Blue)';
        }

        if (selector <= 35) {
            return 'Tank Top (Dark Grey)';
        }

        if (selector <= 39) {
            return 'Tank Top (Green)';
        }

        if (selector <= 43) {
            return 'Tank Top (Light Grey)';
        }

        if (selector <= 47) {
            return 'Tank Top (Pink)';
        }

        if (selector <= 51) {
            return 'Tank Top (Red)';
        }

        if (selector <= 55) {
            return 'Tattered (Blue)';
        }

        if (selector <= 59) {
            return 'Tattered (Dark Grey)';
        }

        if (selector <= 63) {
            return 'Tattered (Light Grey)';
        }

        if (selector <= 67) {
            return 'Tattered (Purple)';
        }

        if (selector <= 71) {
            return 'Tattered (Red)';
        }

        if (selector <= 75) {
            return 'Tattered (Yellow)';
        }

        if (selector <= 79) {
            return 'Winter Jacket (Blue)';
        }

        if (selector <= 83) {
            return 'Winter Jacket (Dark Grey)';
        }

        if (selector <= 87) {
            return 'Winter Jacket (Green)';
        }

        if (selector <= 91) {
            return 'Winter Jacket (Light Grey)';
        }

        if (selector <= 95) {
            return 'Winter Jacket (Pink)';
        }

        return 'Winter Jacket (Purple)';
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
        if (condition === ClothesCondition.STANDARD) {
            return ClothesCondition.STANDARD;
        }

        if (selector <= 19) {
            return 'Laced';
        }

        if (selector <= 39) {
            return 'Leather';
        }

        if (selector <= 59) {
            return 'Sandals';
        }

        if (selector <= 79) {
            return 'Steel Capped';
        }

        return 'Tailored';
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
        if (condition === ClothesCondition.STANDARD) {
            return ClothesCondition.STANDARD;
        }

        if (selector <= 19) {
            return 'Buckled';
        }

        if (selector <= 39) {
            return 'Kingly';
        }

        if (selector <= 59) {
            return 'Patchwork';
        }

        if (selector <= 79) {
            return 'Short Shorts';
        }

        return 'Shorts';
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

        if (selector <= 19) {
            return 'Bejeweled';
        }

        if (selector <= 39) {
            return 'Cap';
        }

        if (selector <= 59) {
            return 'Headband';
        }

        if (selector <= 79) {
            return 'Horned';
        }

        return 'Spiky';
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

        if (selector <= 19) {
            return 'Bones';
        }

        if (selector <= 39) {
            return 'Ornate';
        }

        if (selector <= 59) {
            return 'Reinforced';
        }

        if (selector <= 79) {
            return 'Scutum';
        }

        return 'Wooden';
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

        if (selector <= 19) {
            return 'Axe';
        }

        if (selector <= 39) {
            return 'Plank';
        }

        if (selector <= 59) {
            return 'Hammer';
        }

        if (selector <= 79) {
            return 'Trident';
        }

        return 'Sword';
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
            return ItemCondition.DESTROYED;
        }
        else if (statistic <= 74) {
            return ItemCondition.BATTERED;
        }
        else if (statistic <= 89) {
            return ItemCondition.WAR_TORN;
        }
        else if (statistic <= 96) {
            return ItemCondition.BATTLE_READY;
        }
        else {
            return ItemCondition.FLAWLESS;
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
            return ClothesCondition.STANDARD;
        }
        else if (statistic <= 49) {
            return ClothesCondition.RAGGED;
        }
        else if (statistic <= 74) {
            return ClothesCondition.ROUGH;
        }
        else if (statistic <= 89) {
            return ClothesCondition.USED;
        }
        else if (statistic <= 96) {
            return ClothesCondition.GOOD;
        }
        else {
            return ClothesCondition.PERFECT;
        }
    }
}
