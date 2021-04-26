import path from 'path';
import fs from 'fs';
import gm from 'gm';

import { AssetSpecs } from '../models/utils/assetSpec.model';

export class ImageHelper {

    public static readonly VIKING_OUT = path.join(process.env.IMAGE_OUTPUT_ROOT!, 'vikings');

    private static readonly ATLAS_OUT = path.join(process.env.IMAGE_OUTPUT_ROOT!, 'atlas');

    private static readonly BASE_URI = `${process.env.API_URL!}/static`;

    private static readonly UNKNOWN_IMAGE = 'viking_unknown.png';

    public static initialize(): void {
        ImageHelper.mkDirOptional(ImageHelper.VIKING_OUT);
        ImageHelper.mkDirOptional(ImageHelper.ATLAS_OUT);

        // TODO a little hacky doing this here, but oh well?
        const unknownOut = path.join(ImageHelper.VIKING_OUT, ImageHelper.UNKNOWN_IMAGE);
        if (!fs.existsSync(unknownOut)) {
            fs.copyFileSync(path.join(process.env.IMAGE_INPUT_ROOT!, ImageHelper.UNKNOWN_IMAGE), unknownOut);
        }
    }

    public static getImageUrl(fileName: string): string {
        return `${ImageHelper.BASE_URI}/${fileName}.png`;
    }

    // TODO proper error handling
    public static async generateImage(assetSpecifications: AssetSpecs): Promise<string> {
        const fileName = `viking_${assetSpecifications.number}.png`;
        const filePath = path.join(ImageHelper.VIKING_OUT, fileName);
        const imageUrl = ImageHelper.getImageUrl(`viking_${assetSpecifications.number}`);

        return new Promise((resolve, reject) => {
            const image = gm('');

            image
                .in(assetSpecifications.filePaths.body)
                .in(assetSpecifications.filePaths.face)
                .in(assetSpecifications.filePaths.top)
                .in(assetSpecifications.filePaths.beard)
                .in(assetSpecifications.filePaths.bottoms)
                .in(assetSpecifications.filePaths.boots);

            if (assetSpecifications.filePaths.helmet) {
                image.in(assetSpecifications.filePaths.helmet);
            }

            if (assetSpecifications.filePaths.shield) {
                image.in(assetSpecifications.filePaths.shield);
            }

            if (assetSpecifications.filePaths.weapon) {
                image.in(assetSpecifications.filePaths.weapon);
            }

            image
                .background('transparent')
                .mosaic()
                .resize(1024, 1024)
                .write(filePath, ((err) => err ? reject(err) : resolve(imageUrl)));
        });
    }

    // TODO proper error handling
    public static generateAtlas(): Promise<string> {
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

    private static mkDirOptional(path: string): void {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
    }
}
