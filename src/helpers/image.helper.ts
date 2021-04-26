import path from 'path';
import fs from 'fs';
import gm from 'gm';

import { AssetSpecs } from '../models/utils/assetSpec.model';
import { AssetPaths } from '../models/utils/assetPaths.model';
import { ErrorHelper } from './error.helper';
import { HttpErrorCode } from '../enums/httpErrorCode.enum';

/**
 * The ImageHelper, implementing the asset composition routine so as to produce Viking Images based on generated Viking Metadata
 *
 * // TODO
 */
export class ImageHelper {

    public static readonly VIKING_OUT = path.join(process.env.IMAGE_OUTPUT_ROOT!, 'vikings');

    private static readonly OUT_ROOT = process.env.IMAGE_OUTPUT_ROOT!;

    private static readonly ATLAS_OUT = path.join(ImageHelper.OUT_ROOT, 'atlas');

    private static readonly PARTS_ROOT = process.env.IMAGE_INPUT_ROOT!;

    private static readonly directories = {
        beards: path.join(ImageHelper.PARTS_ROOT, 'beards'),
        bodies: path.join(ImageHelper.PARTS_ROOT, 'bodies'),
        boots: path.join(ImageHelper.PARTS_ROOT, 'boots'),
        bottoms: path.join(ImageHelper.PARTS_ROOT, 'bottoms'),
        faces: path.join(ImageHelper.PARTS_ROOT, 'faces'),
        helmets: path.join(ImageHelper.PARTS_ROOT, 'helmets'),
        shields: path.join(ImageHelper.PARTS_ROOT, 'shields'),
        tops: path.join(ImageHelper.PARTS_ROOT, 'tops'),
        weapons: path.join(ImageHelper.PARTS_ROOT, 'weapons')
    };

    /**
     * Compose a Viking Image based on a VikingMetadata specification
     *
     * @param metadata the VikingMetadata
     *
     * @returns the file path to the generated image
     */
    public static async composeImage(number: number, assetSpecs: AssetSpecs): Promise<string> {
        ImageHelper.mkDirOptional(ImageHelper.VIKING_OUT);

        const paths = ImageHelper.resolveAssetPaths(assetSpecs);

        return ImageHelper.generateImage(`viking_${number}`, paths).catch(() => {
            throw ErrorHelper.createError(HttpErrorCode.INTERNAL_SERVER_ERROR, 'Image generation failed');
        });
    }

    public static composeAtlas(): Promise<string> {
        ImageHelper.mkDirOptional(ImageHelper.ATLAS_OUT);

        return ImageHelper.generateAtlas().catch(() => {
            throw ErrorHelper.createError(HttpErrorCode.INTERNAL_SERVER_ERROR, 'Atlas generation failed');
        });
    }

    public static clear(): void {
        fs.rmSync(ImageHelper.OUT_ROOT, { recursive: true, force: true });
    }

    public static getOutputPaths(fileName: string): { imageUrl: string, filePath: string } {
        const actualFileName = `${fileName.replace(/\s-/g, '_').toLowerCase()}.png`;

        return {
            imageUrl: `${process.env.API_URL!}/static/${actualFileName}`,
            filePath: path.join(ImageHelper.VIKING_OUT, actualFileName)
        };
    }

    private static mkDirOptional(dir: string): void {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    private static resolveAssetPaths(assetSpecs: AssetSpecs): AssetPaths {
        const beardFile = `beard_${assetSpecs.names.beard.replace(/\s/g, '_').toLowerCase()}.png`;
        const bodyFile = `body_${assetSpecs.names.body.replace(/\s/g, '_').toLowerCase()}.png`;
        const faceFile = `face_${assetSpecs.names.face.replace(/\s/g, '_').toLowerCase()}.png`;
        const topFile = `top_${assetSpecs.names.top.replace(/\s/g, '_').toLowerCase()}.png`;

        const paths: AssetPaths = {
            beard: path.join(ImageHelper.directories.beards, beardFile),
            body: path.join(ImageHelper.directories.bodies, bodyFile),
            face: path.join(ImageHelper.directories.faces, faceFile),
            top: path.join(ImageHelper.directories.tops, topFile)
        };

        // TODO basic handling
        if (assetSpecs.conditions.boots !== 'Basic') {
            const bootsName = assetSpecs.names.boots.replace(/\s/g, '_').toLowerCase();

            paths.boots = path.join(
                ImageHelper.directories.boots,
                bootsName,
                `boots_${bootsName}_${assetSpecs.conditions.boots.toLowerCase()}.png`
            );
        }

        // TODO basic handling
        if (assetSpecs.conditions.bottoms !== 'Basic') {
            const bottomsName = assetSpecs.names.bottoms.replace(/\s/g, '_').toLowerCase();

            paths.bottoms = path.join(
                ImageHelper.directories.bottoms,
                bottomsName,
                `bottoms_${bottomsName}_${assetSpecs.conditions.bottoms.toLowerCase()}.png`
            );
        }

        if (assetSpecs.conditions.helmet !== 'None') {
            const helmetName = assetSpecs.names.helmet.replace(/\s/g, '_').toLowerCase();

            paths.helmet = path.join(
                ImageHelper.directories.helmets,
                helmetName,
                `helmet_${helmetName}_${assetSpecs.conditions.helmet.toLowerCase()}.png`
            );
        }

        // unused for now (no assets)
        // if (assetSpecs.conditions.shield !== 'None') {
        //     const shieldName = assetSpecs.names.shield.replace(/\s/g, '_').toLowerCase();

        //     paths.shield = path.join(
        //         ImageHelper.directories.shields,
        //         shieldName,
        //         `shield_${shieldName}_${assetSpecs.conditions.shield.toLowerCase()}.png`
        //     );
        // }

        // unused for now (no assets)
        // if (assetSpecs.conditions.weapon !== 'None') {
        //     const weaponName = assetSpecs.names.weapon.replace(/\s/g, '_').toLowerCase();

        //     paths.weapon = path.join(
        //         ImageHelper.directories.weapons,
        //         weaponName,
        //         `weapon_${weaponName}_${assetSpecs.conditions.weapon.toLowerCase()}.png`
        //     );
        // }

        return paths;
    }

    private static generateImage(fileName: string, paths: AssetPaths): Promise<string> {
        const { imageUrl, filePath } = ImageHelper.getOutputPaths(fileName);

        return new Promise((resolve, reject) => {
            const image = gm('');

            image
                .in(paths.body)
                .in(paths.face)
                .in(paths.top)
                .in(paths.beard);

            if (paths.boots) {
                image.in(paths.boots)
            }
            if (paths.bottoms) {
                image.in(paths.bottoms);
            }
            if (paths.helmet) {
                image.in(paths.helmet)
            }
            // if (paths.shield) {
            //     image.in(paths.shield);
            // }
            // if (paths.weapon) {
            //     image.in(paths.weapon);
            // }

            image
                .background('transparent')
                .mosaic()
                .resize(1024, 1024)
                .write(filePath, ((err) => err ? reject(err) : resolve(imageUrl)));
        });
    }

    private static generateAtlas(): Promise<string> {
        return new Promise((resolve, reject) => {
            const outPath = path.join(ImageHelper.ATLAS_OUT, 'atlas.png');
            const image = gm('');

            for (const file of fs.readdirSync(ImageHelper.VIKING_OUT)) {
                image.montage(path.join(ImageHelper.VIKING_OUT, file));
            }

            image
                .geometry('+0+0')
                .background('transparent')
                .write(outPath, (err) => err ? reject(err) : resolve(outPath));
        });
    }
}
