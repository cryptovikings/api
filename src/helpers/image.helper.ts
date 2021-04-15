import path from 'path';
import fs from 'fs';
import gm from 'gm';

import { AssetSpecs } from '../models/assetSpec.model';
import { AssetPaths } from '../models/assetPaths.model';

/**
 * The ImageHelper, implementing the asset composition routine so as to produce Viking Images based on generated Viking Metadata
 */
export class ImageHelper {

    private static outRoot = 'out';

    private static vikingOut = path.join(ImageHelper.outRoot, 'vikings');

    private static atlasOut = path.join(ImageHelper.outRoot, 'atlas');

    private static partsRoot = 'res/';

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
    public static async composeImage(assetSpecs: AssetSpecs): Promise<string> {
        ImageHelper.mkDirOptional(ImageHelper.vikingOut);

        const paths = ImageHelper.resolveAssetPaths(assetSpecs);

        ImageHelper.generateImage(assetSpecs.names.viking, paths).catch((err) => console.log('ERROR', err));

        const filePath = await ImageHelper.generateImage(assetSpecs.names.viking, paths);

        return filePath;
    }

    public static generateAtlas(): Promise<string> {
        ImageHelper.mkDirOptional(ImageHelper.atlasOut);

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

        if (assetSpecs.conditions.boots !== 'None') {
            const bootsName = assetSpecs.names.boots.replace(/\s/g, '_').toLowerCase();

            paths.boots = path.join(
                ImageHelper.directories.boots,
                bootsName,
                `boots_${bootsName}_${assetSpecs.conditions.boots.toLowerCase()}.png`
            );
        }

        if (assetSpecs.conditions.bottoms !== 'None') {
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

    private static async generateImage(fileName: string, paths: AssetPaths): Promise<string> {
        const filePath = path.join(ImageHelper.vikingOut, `${fileName.replace(/\s/g, '_').toLowerCase()}.png`);

        return new Promise((resolve, reject) => {
            const image = gm('');

            for (const value of Object.values(paths)) {
                image.in(value);
            }

            image
                .background('transparent')
                .mosaic()
                .write(filePath, ((err) => err ? reject(err) : resolve(filePath)));
        });
    }
}
