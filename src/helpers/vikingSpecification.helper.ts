import path from 'path';

import { VikingSpecification } from '../models/viking/vikingSpecification.model';
import { Viking } from '../models/viking/viking.model';
import { VikingComponents, VikingConditions, VikingStats } from '../models/viking/vikingStructs.model';

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

    // public static buildSpecificationFromDatabase(number: number, data: Viking['read']): VikingSpecification {

    // }

    public static buildSpecificationFromContract(
        number: number,
        stats: VikingStats,
        components: VikingComponents,
        conditions: VikingConditions
    ): VikingSpecification {

        const cleanName = (name: string): string => name.replace(/[\s-]/g, '_').toLocaleLowerCase();

        // resolve the File Paths for the beard + body + face + top parts
        const beardFile = path.join(VikingSpecificationHelper.directories.beards, `beard_${cleanName(components.beard)}.png`);
        const bodyFile = path.join(VikingSpecificationHelper.directories.bodies, `body_${cleanName(components.body)}.png`);
        const faceFile = path.join(VikingSpecificationHelper.directories.faces, `face_${cleanName(components.face)}.png`);
        const topFile = path.join(VikingSpecificationHelper.directories.tops, `top_${cleanName(components.top)}.png`);

        // resolve the Boots File Path, defaulting to the "Basic" boots asset if the statistic-based Condition wasn't good enough
        let bootsFile = path.join(VikingSpecificationHelper.directories.boots, 'boots_standard.png');
        if (conditions.boots !== 'Standard') {
            const style = cleanName(components.boots);
            const condition = cleanName(conditions.boots);

            bootsFile = path.join(VikingSpecificationHelper.directories.boots, style, `boots_${style}_${condition}.png`);
        }

        // resolve the Bottoms File Path, defaulting to the "Basic" bottoms asset if the statistic-based Condition wasn't good enough
        let bottomsFile = path.join(VikingSpecificationHelper.directories.bottoms, 'bottoms_standard.png');
        if (conditions.bottoms !== 'Standard') {
            const style = cleanName(components.bottoms);
            const condition = cleanName(conditions.bottoms);

            bottomsFile = path.join(VikingSpecificationHelper.directories.bottoms, style, `bottoms_${style}_${condition}.png`);
        }

        // resolve the Helmet File Path, defaulting to undefined if the statistic-based Condition wasn't good enough
        let helmetFile = undefined;
        if (conditions.helmet !== 'None') {
            const style = cleanName(components.helmet);
            const condition = cleanName(conditions.helmet);

            helmetFile = path.join(VikingSpecificationHelper.directories.helmets, style, `helmet_${style}_${condition}.png`);
        }

        // resolve the Shield File Path, defaulting to undefined if the statistic-based Condition wasn't good enough
        let shieldFile = undefined;
        if (conditions.shield !== 'None') {
            const style = cleanName(components.shield);
            const condition = cleanName(conditions.shield);

            shieldFile = path.join(VikingSpecificationHelper.directories.shields, style, `shield_${style}_${condition}.png`);
        }

        // resolve the Weapon File Path, defaulting to undefined if the statistic-based Condition wasn't good enough
        let weaponFile = undefined;
        if (conditions.weapon !== 'None') {
            const style = cleanName(components.weapon);
            const condition = cleanName(conditions.weapon);

            weaponFile = path.join(VikingSpecificationHelper.directories.weapons, style, `weapon_${style}_${condition}.png`);
        }

        return {
            number,
            name: stats.name,
            image: `viking_${number}`,
            texture: `viking_${number}`,
            conditions: {
                boots: conditions.boots,
                bottoms: conditions.bottoms,
                helmet: conditions.helmet,
                shield: conditions.shield,
                weapon: conditions.weapon
            },
            stats: {
                attack: stats.attack.toNumber(),
                defence: stats.defence.toNumber(),
                intelligence: stats.intelligence.toNumber(),
                speed: stats.speed.toNumber(),
                stamina: stats.stamina.toNumber()
            },
            styles: {
                beard: components.beard,
                body: components.body,
                boots: components.boots,
                bottoms: components.bottoms,
                face: components.face,
                helmet: components.helmet,
                shield: components.shield,
                top: components.shield,
                weapon: components.weapon
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

    // /**
    //  * Core VikingSpecification production method. Take a Viking Number and some representative data, and produce all the information necessary to
    //  *   generate a Viking for the database as well as a Viking Image, including:
    //  *       - Part Type Names
    //  *       - Item/Clothing Conditions
    //  *       - Statistics
    //  *       - File Paths for each Part
    //  *
    //  * Capable of building a specification off of both a Contract Viking representation as well as a Local Viking representation. This enables use
    // eslint-disable-next-line
    //  *   both in generating Vikings + Images from Contract data in Eth Event Handling, and in generating missing Images based on stored Database Data
    //  *
    //  * @param number the ID of the Viking
    //  * @param data the data, in Contract or Local representations
    //  */
    // public static buildVikingSpecification(number: number, data: VikingContractModel | Viking['read']): VikingSpecification {
    //     // simple string transformer for producing file name parts by replacing spaces and hyphens with underscores
    //     const cleanName = (name: string): string => name.replace(/[\s-]/g, '_').toLowerCase();

    //     // statistics
    //     let attack: number,
    //         defence: number,
    //         intelligence: number,
    //         speed: number,
    //         stamina: number;

    //     // conditions
    //     let bootsCondition: ClothesCondition,
    //         bottomsCondition: ClothesCondition,
    //         helmetCondition: ItemCondition,
    //         shieldCondition: ItemCondition,
    //         weaponCondition: ItemCondition;

    //     // part names
    //     let bootsType: string,
    //         bottomsType: string,
    //         helmetType: string,
    //         shieldType: string,
    //         weaponType: string,
    //         beardType: string,
    //         bodyType: string,
    //         faceType: string,
    //         topType: string;

    //     if (VikingSpecificationHelper.isVikingContractModel(data)) {
    //         // if we're building from Contract data, resolve

    //         attack = data.attack.toNumber();
    //         defence = data.defence.toNumber();
    //         intelligence = data.intelligence.toNumber();
    //         speed = data.speed.toNumber();
    //         stamina = data.stamina.toNumber();

    //         bootsCondition = VikingSpecificationHelper.resolveClothesCondition(speed);
    //         bottomsCondition = VikingSpecificationHelper.resolveClothesCondition(stamina);
    //         helmetCondition = VikingSpecificationHelper.resolveItemCondition(intelligence);
    //         shieldCondition = VikingSpecificationHelper.resolveItemCondition(defence);
    //         weaponCondition = VikingSpecificationHelper.resolveItemCondition(attack);

    //         bootsType = VikingSpecificationHelper.resolveBootsType(data.boots.toNumber(), bootsCondition);
    //         bottomsType = VikingSpecificationHelper.resolveBottomsType(data.bottoms.toNumber(), bottomsCondition);
    //         helmetType = VikingSpecificationHelper.resolveHelmetType(data.helmet.toNumber(), helmetCondition);
    //         shieldType = VikingSpecificationHelper.resolveShieldType(data.shield.toNumber(), shieldCondition);
    //         weaponType = VikingSpecificationHelper.resolveWeaponType(data.weapon.toNumber(), weaponCondition);

    //         // resolve the beard + body + face + top type names based on 2-digit sequential slices of the appearance number
    //         const appearance = data.appearance.toString();

    //         beardType = VikingSpecificationHelper.resolveBeardType(parseInt(appearance.slice(0, 2), 10));
    //         bodyType = VikingSpecificationHelper.resolveBodyType(parseInt(appearance.slice(2, 4), 10));
    //         faceType = VikingSpecificationHelper.resolveFaceType(parseInt(appearance.slice(4, 6), 10));
    //         topType = VikingSpecificationHelper.resolveTopType(parseInt(appearance.slice(6, 8), 10));
    //     }
    //     else {
    //         // if we're building from Database data, copy

    //         attack = data.attack;
    //         defence = data.defence;
    //         intelligence = data.intelligence;
    //         speed = data.speed;
    //         stamina = data.stamina;

    //         bootsCondition = data.boots_condition;
    //         bottomsCondition = data.bottoms_condition;
    //         helmetCondition = data.helmet_condition;
    //         shieldCondition = data.shield_condition;
    //         weaponCondition = data.weapon_condition;

    //         bootsType = data.boots_name;
    //         bottomsType = data.bottoms_name;
    //         helmetType = data.helmet_name;
    //         shieldType = data.shield_name;
    //         weaponType = data.weapon_name;

    //         beardType = data.beard_name;
    //         bodyType = data.body_name;
    //         faceType = data.face_name;
    //         topType = data.top_name;
    //     }

    //     // resolve the File Paths for the beard + body + face + top parts
    //     const beardFile = path.join(VikingSpecificationHelper.directories.beards, `beard_${cleanName(beardType)}.png`);
    //     const bodyFile = path.join(VikingSpecificationHelper.directories.bodies, `body_${cleanName(bodyType)}.png`);
    //     const faceFile = path.join(VikingSpecificationHelper.directories.faces, `face_${cleanName(faceType)}.png`);
    //     const topFile = path.join(VikingSpecificationHelper.directories.tops, `top_${cleanName(topType)}.png`);

    //     // resolve the Boots File Path, defaulting to the "Basic" boots asset if the statistic-based Condition wasn't good enough
    //     let bootsFile = path.join(VikingSpecificationHelper.directories.boots, 'boots_standard.png');
    //     if (bootsCondition !== ClothesCondition.STANDARD) {
    //         const type = cleanName(bootsType);
    //         const condition = cleanName(bootsCondition);

    //         bootsFile = path.join(VikingSpecificationHelper.directories.boots, type, `boots_${type}_${condition}.png`);
    //     }

    //     // resolve the Bottoms File Path, defaulting to the "Basic" bottoms asset if the statistic-based Condition wasn't good enough
    //     let bottomsFile = path.join(VikingSpecificationHelper.directories.bottoms, 'bottoms_standard.png');
    //     if (bottomsCondition !== ClothesCondition.STANDARD) {
    //         const type = cleanName(bottomsType);
    //         const condition = cleanName(bottomsCondition);

    //         bottomsFile = path.join(VikingSpecificationHelper.directories.bottoms, type, `bottoms_${type}_${condition}.png`);
    //     }

    //     // resolve the Helmet File Path, defaulting to undefined if the statistic-based Condition wasn't good enough
    //     let helmetFile = undefined;
    //     if (helmetCondition !== ItemCondition.NONE) {
    //         const type = cleanName(helmetType);
    //         const condition = cleanName(helmetCondition);

    //         helmetFile = path.join(VikingSpecificationHelper.directories.helmets, type, `helmet_${type}_${condition}.png`);
    //     }

    //     // resolve the Shield File Path, defaulting to undefined if the statistic-based Condition wasn't good enough
    //     let shieldFile = undefined;
    //     if (shieldCondition !== ItemCondition.NONE) {
    //         const type = cleanName(shieldType);
    //         const condition = cleanName(shieldCondition);

    //         shieldFile = path.join(VikingSpecificationHelper.directories.shields, type, `shield_${type}_${condition}.png`);
    //     }

    //     // resolve the Weapon File Path, defaulting to undefined if the statistic-based Condition wasn't good enough
    //     let weaponFile = undefined;
    //     if (weaponCondition !== ItemCondition.NONE) {
    //         const type = cleanName(weaponType);
    //         const condition = cleanName(weaponCondition);

    //         weaponFile = path.join(VikingSpecificationHelper.directories.weapons, type, `weapon_${type}_${condition}.png`);
    //     }

    //     // build the VikingSpecification structure for use in Viking and Image generation
    //     return {
    //         number,
    //         name: data.name,
    //         image: `viking_${number}`,
    //         texture: `viking_${number}`,
    //         types: {
    //             beard: beardType,
    //             body: bodyType,
    //             face: faceType,
    //             top: topType,

    //             boots: bootsType,
    //             bottoms: bottomsType,

    //             helmet: helmetType,
    //             shield: shieldType,
    //             weapon: weaponType
    //         },
    //         stats: {
    //             attack,
    //             defence,
    //             intelligence,
    //             speed,
    //             stamina
    //         },
    //         conditions: {
    //             boots: bootsCondition,
    //             bottoms: bottomsCondition,

    //             helmet: helmetCondition,
    //             shield: shieldCondition,
    //             weapon: weaponCondition
    //         },
    //         filePaths: {
    //             beard: beardFile,
    //             body: bodyFile,
    //             face: faceFile,
    //             top: topFile,
    //             boots: bootsFile,
    //             bottoms: bottomsFile,
    //             helmet: helmetFile,
    //             shield: shieldFile,
    //             weapon: weaponFile
    //         }
    //     };
    // }

    // /**
    //  * Type guard for differentiating between Viking Contract Data and Viking Database Data
    //  *
    //  * @param data the data to inspect
    //  *
    //  * @returns whether or not the data is a VikingContractModel
    //  */
    // private static isVikingContractModel(data: VikingContractModel | Viking['read']): data is VikingContractModel {
    //     return !!(data as VikingContractModel).appearance;
    // }
}
