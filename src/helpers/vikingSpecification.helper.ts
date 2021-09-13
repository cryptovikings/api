import path from 'path';

import { VikingSpecification } from '../models/viking/vikingSpecification.model';
import { Viking } from '../models/viking/viking.model';
import { VikingComponents, VikingConditions, VikingStats } from '../models/viking/vikingStructs.model';

/**
 * VikingSpecification Helper, centralising the production of the intermediate VikingSpecification data format, used in generating Viking Database Data and in
 *   producing Viking Images
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
     * Build a VikingSpecification from Viking Database Data. Mostly just a copy-across job except for the filePaths which are resolved using reconstructed
     *   VikingComponents and VikingConditions
     *
     * @param data the Viking Database Data to build from
     *
     * @returns the VikingSpecification
     */
    public static buildSpecificationFromDatabase(data: Viking['read']): VikingSpecification {
        return {
            number: data.number,
            name: data.name,
            image: data.image,
            texture: data.texture,
            conditions: {
                boots: data.boots_condition,
                bottoms: data.bottoms_condition,
                helmet: data.helmet_condition,
                shield: data.shield_condition,
                weapon: data.weapon_condition
            },
            stats: {
                attack: data.attack,
                defence: data.defence,
                intelligence: data.intelligence,
                speed: data.speed,
                stamina: data.stamina
            },
            styles: {
                beard: data.beard_name,
                body: data.body_name,
                boots: data.boots_name,
                bottoms: data.bottoms_name,
                face: data.face_name,
                helmet: data.helmet_name,
                shield: data.shield_name,
                top: data.top_name,
                weapon: data.weapon_name
            },
            filePaths: VikingSpecificationHelper.resolveFilePaths(
                {
                    beard: data.beard_name,
                    body: data.body_name,
                    boots: data.boots_name,
                    bottoms: data.bottoms_name,
                    face: data.face_name,
                    helmet: data.helmet_name,
                    shield: data.shield_name,
                    top: data.top_name,
                    weapon: data.weapon_name
                },
                {
                    boots: data.boots_condition,
                    bottoms: data.bottoms_condition,
                    helmet: data.helmet_condition,
                    shield: data.shield_condition,
                    weapon: data.weapon_condition
                }
            )
        };
    }

    /**
     * Build a VikingSpecification from Viking Contract Data
     *
     * @param number the Token ID of the Viking
     * @param stats the VikingStats from the Contract
     * @param components the VikingComponents from the Contract
     * @param conditions the VikingConditions from the Contract
     *
     * @returns the VikingSpecification
     */
    public static buildSpecificationFromContract(number: number, stats: VikingStats, components: VikingComponents, conditions: VikingConditions): VikingSpecification {
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
                top: components.top,
                weapon: components.weapon
            },
            filePaths: VikingSpecificationHelper.resolveFilePaths(components, conditions)
        };
    }

    /**
     * Given a VikingComponents and a VikingConditions, resolve the file paths of each of the Viking's assets for use in generating the final image
     *
     * @param components the VikingComponents
     * @param conditions the VikingConditions
     *
     * @returns the filePaths part of the VikingSpecification
     */
    private static resolveFilePaths(components: VikingComponents, conditions: VikingConditions): VikingSpecification['filePaths'] {
        // component + condition name sanitizer for use in filenames
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
            beard: beardFile,
            body: bodyFile,
            face: faceFile,
            top: topFile,
            boots: bootsFile,
            bottoms: bottomsFile,
            helmet: helmetFile,
            shield: shieldFile,
            weapon: weaponFile
        };
    }
}
