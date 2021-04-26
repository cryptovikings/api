import path from 'path';
import fs from 'fs';
import gm from 'gm';

import { NewAssetSpecs } from '../models/utils/assetSpec.model';

export class NewImageHelper {

    public static readonly VIKING_OUT = path.join(process.env.IMAGE_OUTPUT_ROOT!, 'vikings');

    private static readonly ATLAS_OUT = path.join(process.env.IMAGE_OUTPUT_ROOT!, 'atlas');

    private static readonly BASE_URI = `${process.env.API_URL!}/static`;

    public static initialize(): void {
        NewImageHelper.mkDirOptional(NewImageHelper.VIKING_OUT);
        NewImageHelper.mkDirOptional(NewImageHelper.ATLAS_OUT);
    }

    public static async generateImage(assetSpecifications: NewAssetSpecs): Promise<string> {
        const fileName = `viking_${assetSpecifications.number}.png`;
        const filePath = path.join(NewImageHelper.VIKING_OUT, fileName);
        const imageUrl = `${NewImageHelper.BASE_URI}/${fileName}`;

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

    private static mkDirOptional(path: string): void {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
    }
}
