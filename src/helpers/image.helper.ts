import path from 'path';
import fs from 'fs';
import gm from 'gm';

import { VikingSpecification } from '../models/viking/vikingSpecification.model';

/**
 * Image Helper, centralising logic for the production of Viking Images based on intermediate Contract-Data-based VikingSpecification, encapsulating
 *   all GraphicsMagick interactions and image output management
 */
export class ImageHelper {

    /**
     * Viking Image output folder, derived from the root output folder as provided in the environment
     */
    public static readonly VIKING_OUT = path.join(process.env.IMAGE_OUTPUT_ROOT!, 'vikings');

    /**
     * Viking Atlas output folder, derived from the root output folder as provided in the environment
     */
    private static readonly ATLAS_OUT = path.join(process.env.IMAGE_OUTPUT_ROOT!, 'atlas');

    /**
     * Name of the "Unknown" Viking Image file, to be addressed in initialization
     */
    private static readonly UNKNOWN_IMAGE = 'viking_unknown.png';

    /**
     * Initialize by ensuring that output folders for Viking Images and the Atlas exist, and by copying the "Unknown" Viking Image to the output
     *   folder if necessary
     */
    public static initialize(): void {
        ImageHelper.mkDirOptional(ImageHelper.VIKING_OUT);
        ImageHelper.mkDirOptional(ImageHelper.ATLAS_OUT);

        const unknownOut = path.join(ImageHelper.VIKING_OUT, ImageHelper.UNKNOWN_IMAGE);
        if (!fs.existsSync(unknownOut)) {
            fs.copyFileSync(path.join(process.env.IMAGE_INPUT_ROOT!, ImageHelper.UNKNOWN_IMAGE), unknownOut);
        }
    }

    /**
     * Given a VikingSpecification, compose and output a Viking Image by building it from the specified parts with GraphicsMagick
     *
     * @param vikingSpecification the VikingSpecification, derived from Viking Contract Data, containing the Viking information
     */
    public static async generateImage(vikingSpecification: VikingSpecification): Promise<void> {
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

    /**
     * Generate an Atlas for demonstration purposes by picking the first 12 Viking Images and combining them into a single image with GraphicsMagick
     */
    public static generateAtlas(): Promise<void> {
        // wrap the GM process into a Promise so that it can be awaited
        return new Promise((resolve, reject) => {
            const filePath = path.join(ImageHelper.ATLAS_OUT, 'atlas.png');

            // initialise an empty gm()
            const image = gm('');

            // montage the first 12 Viking Image files
            let i = 0;
            for (const file of fs.readdirSync(ImageHelper.VIKING_OUT)) {
                image.montage(path.join(ImageHelper.VIKING_OUT, file));

                i++;
                if (i === 12) {
                    break;
                }
            }

            // configure and output the combined image
            image
                .geometry('+0+0')
                .background('transparent')
                .write(filePath, (err) => err ? reject(err) : resolve());
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
