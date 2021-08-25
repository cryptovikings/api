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
    ];

    /**
     * Viking Image output folder, derived from the viking output folder as provided in the environment
     */
    public static readonly VIKING_OUT = path.join(__dirname, '../../', process.env.IMAGE_VIKING_OUTPUT!);

    /**
     * Texture Image output folder, derived from the texture output folder as provided in the environment
     */
    public static readonly TEXTURE_OUT = path.join(__dirname, '../../', process.env.IMAGE_TEXTURE_OUTPUT!);

    /**
     * Texture Image input folder, derived from the texture input folder as provided in the environment
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
                .write(filePath, ((err) => {
                    err ? reject(`${err.message} : ${JSON.stringify(vikingSpecification.filePaths)}`) : resolve()
                }));
        });
    }

    /**
     * Generate an Atlas of a given maximum number of Vikings
     *
     * @param maxVikings the maximum number of vikings to include
     */
    public static async generateVikingAtlas(maxVikings: number): Promise<void> {
        // wrap the GM process into a Promise so that it can be awaited
        return new Promise((resolve, reject) => {
            const filePath = path.join(ImageHelper.VIKING_OUT, '_atlas.png');

            // initialise an empty gm()
            const image = gm('');

            // montage a random set of <=maxVikings Viking Image files
            const count = fs.readdirSync(ImageHelper.VIKING_OUT).filter((f) => !f.includes('unknown')).length;
            const amount = Math.min(count, maxVikings);
            const previous: Array<number> = [];

            for (let i = 0; i < amount; i++) {
                let number = TestHelper.random(count);

                while (previous.includes(number)) {
                    number = TestHelper.random(count);
                }

                previous.push(number);

                const fileName = `viking_${number}.png`;
                const file = path.join(ImageHelper.VIKING_OUT, fileName);

                image.montage(file);
            }

            // configure and output the combined image
            image
                .geometry('+0+0')
                .background('transparent')
                .write(filePath, (err) => err ? reject(err) : resolve());
        });
    }

    /**
     * Given a File Name, retrieve a Texture Image for use in front-end games
     *
     * Transparently generates the Texture Image if it does not already exist, producing the more efficient on-demand-generation procedure for Texture
     *   Images, as rationalised in the TextureController's documentation
     *
     * Texture Images are named with the Viking Number, in a 1-1 mapping of Viking Data => Viking Image => Texture Image
     *
     * @param fileName the name of the Texture Image file to retrieve
     *
     * @returns the file path of the extant or generated Texture Image file
     */
    public static async getTextureImage(fileName: string): Promise<string> {
        const texturePath = path.join(ImageHelper.TEXTURE_OUT, fileName);

        if (fs.existsSync(texturePath)) {
            return texturePath;
        }

        return new Promise((resolve, reject) => {
            const vikingImagePath = path.join(ImageHelper.VIKING_OUT, fileName);

            if (!fs.existsSync(vikingImagePath)) {
                reject(`Failed to retrieve texture file : Viking Image ${fileName} does not exist`);
            }

            // prepare the Viking image by downsizing it for inclusion in the Atlas
            gm(vikingImagePath)
                .resize(256, 256)
                .write(texturePath, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        // now that the appropriately-sized Viking Image is ready, generate the Texture Image by atlasing it with other game textures
                        const image = gm('');

                        // ensure that Viking comes first (place it in position (0,0) for front-end texture sampling)
                        image.montage(texturePath);

                        const files = fs.readdirSync(ImageHelper.TEXTURE_INPUT_ROOT);
                        for (const file of files) {
                            image.montage(path.join(ImageHelper.TEXTURE_INPUT_ROOT, file));
                        }

                        image
                            .tile(`${files.length + 1}x1`)
                            .geometry('+0+0')
                            .background('transparent')
                            .write(texturePath, (err) => err ? reject(err) : resolve(texturePath));
                    }
                });
        });
    }

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
