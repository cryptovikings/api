import path from 'path';
import fs from 'fs';
import gm from 'gm';

import { VikingSpecification } from '../models/viking/vikingSpecification.model';
import { TestHelper } from './test.helper';

/**
 * Image Helper, centralising logic for the production of Viking Images based on intermediate Contract-Data-based VikingSpecification, encapsulating
 *   all GraphicsMagick interactions and image output management
 */
export class ImageHelper {

    /**
     * Names of default Viking Images which will always exist in the output directory
     */
    public static readonly DEFAULT_IMAGES = [
        'viking_unknown.png'
    ]

    /**
     * Viking Image output folder, derived from the root output folder as provided in the environment
     */
    public static readonly VIKING_OUT = path.join(__dirname, '../../', process.env.IMAGE_VIKING_OUTPUT!);

    /**
     * Viking Atlas output folder, derived from the root output folder as provided in the environment
     */
    public static readonly TEXTURE_OUT = path.join(__dirname, '../../', process.env.IMAGE_TEXTURE_OUTPUT!);

    /**
     * // TODO
     */
    private static readonly TEXTURE_INPUT_ROOT = path.join(__dirname, '../../', process.env.IMAGE_TEXTURE_INPUT_ROOT!);

    /**
     * Initialize by ensuring that output folders for Viking Images and the Atlas exist, and by copying the "Unknown" Viking Image to the output
     *   folder if necessary
     */
    public static initialize(): void {
        ImageHelper.mkDirOptional(ImageHelper.VIKING_OUT);
        ImageHelper.mkDirOptional(ImageHelper.TEXTURE_OUT);

        for (const image of ImageHelper.DEFAULT_IMAGES) {
            const input = path.join(__dirname, '../../', process.env.IMAGE_VIKING_INPUT_ROOT!, image);
            const output = path.join(ImageHelper.VIKING_OUT, image);

            if (!fs.existsSync(output)) {
                fs.copyFileSync(input, output);
            }
        }
    }

    /**
     * Given a VikingSpecification, compose and output a Viking Image by building it from the specified parts with GraphicsMagick
     *
     * @param vikingSpecification the VikingSpecification, derived from Viking Contract Data, containing the Viking information
     */
    public static async generateVikingImage(vikingSpecification: VikingSpecification): Promise<void> {
        // wrap the GM process into a Promise so that it can be awaited
        return new Promise((resolve, reject) => {
            // images are named numerically so as to decouple storage + retrieval from the Viking's actual name
            const filePath = path.join(ImageHelper.VIKING_OUT, `viking_${vikingSpecification.number}.png`);

            // initialize an empty gm()
            const image = gm('');

            // pass in the asset parts in a specific layering order
            image
                .in(vikingSpecification.filePaths.body)
                .in(vikingSpecification.filePaths.face)
                .in(vikingSpecification.filePaths.top)
                .in(vikingSpecification.filePaths.beard)
                .in(vikingSpecification.filePaths.bottoms)
                .in(vikingSpecification.filePaths.boots);

            // only pass in helmet, shield and weapon if their associated statistics weren't low enough to nullify them
            if (vikingSpecification.filePaths.helmet) {
                image.in(vikingSpecification.filePaths.helmet);
            }
            if (vikingSpecification.filePaths.shield) {
                image.in(vikingSpecification.filePaths.shield);
            }
            if (vikingSpecification.filePaths.weapon) {
                image.in(vikingSpecification.filePaths.weapon);
            }

            // configure and output the composed image
            image
                .background('transparent')
                .mosaic()
                .resize(1024, 1024)
                .write(filePath, ((err) => err ? reject(err) : resolve()));
        });
    }

    public static async generateTextureImage(fileName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const texturePath = path.join(ImageHelper.TEXTURE_OUT, fileName);
            const vikingImagePath = path.join(ImageHelper.VIKING_OUT, fileName);

            // prepare the Viking image and then generate the atlas
            gm(vikingImagePath)
                .resize(512, 512)
                .write(texturePath, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        const image = gm('');

                        // ensure the Viking comes first
                        image.montage(texturePath);

                        for (const file of fs.readdirSync(ImageHelper.TEXTURE_INPUT_ROOT)) {
                            image.montage(path.join(ImageHelper.TEXTURE_INPUT_ROOT, file));
                        }

                        image
                            .geometry('+0+0')
                            .background('transparent')
                            .write(texturePath, (err) => err ? reject(err) : resolve());
                    }
                });
        });
    }

    // /**
    // eslint-disable-next-line
    //  * Generate an Atlas for demonstration purposes by picking the first 12 Viking Images and combining them into a single image with GraphicsMagick
    //  */
    // public static generateVikingAtlas(maxVikings: number): Promise<void> {
    //     // wrap the GM process into a Promise so that it can be awaited
    //     return new Promise((resolve, reject) => {
    //         const filePath = path.join(ImageHelper.TEXTURE_OUT, 'atlas.png');

    //         // initialise an empty gm()
    //         const image = gm('');

    //         // montage a random set of 10 (max) Viking Image files
    //         const count = fs.readdirSync(ImageHelper.VIKING_OUT).filter((f) => !f.includes('unknown')).length;
    //         const amount = Math.min(count, maxVikings);
    //         const previous: Array<number> = [];

    //         for (let i = 0; i < amount; i++) {
    //             let number = TestHelper.random(count);

    //             while (previous.includes(number)) {
    //                 number = TestHelper.random(count);
    //             }

    //             previous.push(number);

    //             const fileName = `viking_${number}.png`;
    //             const file = path.join(ImageHelper.VIKING_OUT, fileName);

    //             image.montage(file);
    //         }

    //         // configure and output the combined image
    //         image
    //             .geometry('+0+0')
    //             .background('transparent')
    //             .write(filePath, (err) => err ? reject(err) : resolve());
    //     });
    // }

    /**
     * Internal shorthand utility for creating an output directory only if it doesn't already exist
     *
     * @param path the path of the directory to create
     */
    private static mkDirOptional(path: string): void {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
    }
}
