import path from 'path';
import fs from 'fs';
import gm from 'gm';

import { AssetSpecs } from '../models/assetSpec.model';
import { AssetPaths } from '../models/assetPaths.model';
import { ErrorHelper } from './error.helper';
import { HttpErrorCode } from '../enums/httpErrorCode.enum';

/**
 * The ImageHelper, implementing the asset composition routine so as to produce Viking Images based on generated Viking Metadata
 */
export class ImageHelper {

    private static outRoot = process.env.IMAGE_OUTPUT_ROOT!;

    private static vikingOut = process.env.IMAGE_OUTPUT_VIKING!;

    private static atlasOut = process.env.IMAGE_OUTPUT_ATLAS!;

    private static partsRoot = process.env.IMAGE_INPUT_ROOT!;

    private static directories = {
        beards: path.join(ImageHelper.partsRoot, 'beards'),
        bodies: path.join(ImageHelper.partsRoot, 'bodies'),
        boots: path.join(ImageHelper.partsRoot, 'boots'),
        bottoms: path.join(ImageHelper.partsRoot, 'bottoms'),
        faces: path.join(ImageHelper.partsRoot, 'faces'),
        helmets: path.join(ImageHelper.partsRoot, 'helmets'),
        shields: path.join(ImageHelper.partsRoot, 'shields'),
        tops: path.join(ImageHelper.partsRoot, 'tops'),
        weapons: path.join(ImageHelper.partsRoot, 'weapons')
    };

    /**
     * Compose a Viking Image based on a VikingMetadata specification
     *
     * @param metadata the VikingMetadata
     *
     * @returns the file path to the generated image
     */
    public static async composeImage(number: number, assetSpecs: AssetSpecs): Promise<string> {
        ImageHelper.mkDirOptional(ImageHelper.vikingOut);

        const paths = ImageHelper.resolveAssetPaths(assetSpecs);

        return ImageHelper.generateImage(`viking_${number}`, paths).catch(() => {
            throw ErrorHelper.createError(HttpErrorCode.INTERNAL_SERVER_ERROR, 'Image generation failed');
        });
    }

    public static composeAtlas(): Promise<string> {
        ImageHelper.mkDirOptional(ImageHelper.atlasOut);

        return ImageHelper.generateAtlas().catch(() => {
            throw ErrorHelper.createError(HttpErrorCode.INTERNAL_SERVER_ERROR, 'Atlas generation failed');
        });
    }

    public static clear(): void {
        fs.rmSync(ImageHelper.outRoot, { recursive: true, force: true });
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
        // unused for now (no assets)
        // const topFile = `top_${assetSpecs.names.top.replace(/\s/g, '_').toLowerCase()}.png`;

        const paths: AssetPaths = {
            beard: path.join(ImageHelper.directories.beards, beardFile),
            body: path.join(ImageHelper.directories.bodies, bodyFile),
            face: path.join(ImageHelper.directories.faces, faceFile),
            // unused for now (no assets)
            // top: path.join(ImageHelper.directories.tops, topFile)
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
        const actualName = `${fileName.replace(/\s/g, '_').toLowerCase()}.png`;
        const filePath = path.join(ImageHelper.vikingOut, actualName);
        const imageUrl = `${process.env.API_URL!}/static/${actualName}`;

        return new Promise((resolve, reject) => {
            const image = gm('');

            image
                .in(paths.body)
                .in(paths.face)
                .in(paths.beard);
            // .in(paths.top);

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
                .write(filePath, ((err) => err ? reject(err) : resolve(imageUrl)));
        });
    }

    private static generateAtlas(): Promise<string> {
        return new Promise((resolve, reject) => {
            const outPath = path.join(ImageHelper.atlasOut, 'atlas.png');
            const image = gm('');

            for (const file of fs.readdirSync(ImageHelper.vikingOut)) {
                image.montage(path.join(ImageHelper.vikingOut, file));
            }

            image
                .geometry('+0+0')
                .background('transparent')
                .write(outPath, (err) => err ? reject(err) : resolve(outPath));
        });
    }
}
