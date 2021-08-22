import _pick from 'lodash/pick';

import { VikingSpecification } from '../models/viking/vikingSpecification.model';
import { Viking } from '../models/viking/viking.model';
import { vikingService } from '../services/viking.service';
import { APIQuery } from '../models/utils/apiQuery.model';

/**
 * VikingHelper, centralising logic for the production of Viking Database Data based on intermediate Contract-Data-based VikingSpecification, and of
 *   Viking (OpenSea) Metadata based on stored Viking Database Data
 */
export class VikingHelper {

    /**
     * Base URI for Viking Image URLs, using the API URL + Viking Endpoint copied over from the environment
     */
    private static readonly VIKING_IMAGE_BASE_URL = `${process.env.API_URL!}${process.env.IMAGE_VIKING_ENDPOINT!}`;

    /**
     * Base URL for Texture Image URLs, using the API URL + Texture Endpoint copied over from the environment
     */
    private static readonly TEXTURE_IMAGE_BASE_URL = `${process.env.API_URL!}${process.env.IMAGE_TEXTURE_ENDPOINT!}`;

    /**
     * Base URL for front end Viking links
     */
    private static readonly VIKING_LINK_BASE_URL = `${process.env.FRONT_END_URL!}/viking`;

    /**
     * Given a VikingSpecification, produce and store a Viking in the Database
     *
     * Effectively just a wrapper for (VikingService).createOne()
     *
     * @param vikingSpecification the VikingSpecification, derived from Viking Contract Data, containing the Viking information
     *
     * @returns the created Viking data
     */
    public static async createViking(vikingSpecification: VikingSpecification): Promise<Viking['read']> {
        return vikingService.createOne({
            number: vikingSpecification.number,
            name: vikingSpecification.name,
            image: vikingSpecification.image,
            texture: vikingSpecification.texture,

            description: 'A unique and special viking',

            beard_name: vikingSpecification.types.beard,
            body_name: vikingSpecification.types.body,
            face_name: vikingSpecification.types.face,
            top_name: vikingSpecification.types.top,

            boots_name: vikingSpecification.types.boots,
            boots_condition: vikingSpecification.conditions.boots,
            speed: vikingSpecification.stats.speed,

            bottoms_name: vikingSpecification.types.bottoms,
            bottoms_condition: vikingSpecification.conditions.bottoms,
            stamina: vikingSpecification.stats.stamina,

            helmet_name: vikingSpecification.types.helmet,
            helmet_condition: vikingSpecification.conditions.helmet,
            intelligence: vikingSpecification.stats.intelligence,

            shield_name: vikingSpecification.types.shield,
            shield_condition: vikingSpecification.conditions.shield,
            defence: vikingSpecification.stats.defence,

            weapon_name: vikingSpecification.types.weapon,
            weapon_condition: vikingSpecification.conditions.weapon,
            attack: vikingSpecification.stats.attack,
        });
    }

    /**
     * Given an as-stored Viking Database structure, produce the equivalent (OpenSea) Metadata
     *
     * @param data the Viking Read-format data to transform
     *
     * @returns the transformed Viking Broadcast-format data
     */
    public static resolveMetadata(data: Viking['read'], select: APIQuery['select']): DeepPartial<Viking['broadcast']> {
        // default keys to pick from the Viking Broadcast-format data
        let keys: Array<keyof Viking['write']> = [
            'name',
            'number',
            'image',
            'texture',
            'description'
        ];

        let attributeKeys: Array<keyof Viking['write']> = [
            'beard_name',
            'body_name',
            'face_name',
            'top_name',

            'boots_name',
            'boots_condition',
            'speed',

            'bottoms_name',
            'bottoms_condition',
            'stamina',

            'helmet_name',
            'helmet_condition',
            'intelligence',

            'shield_name',
            'shield_condition',
            'defence',

            'weapon_name',
            'weapon_condition',
            'attack'
        ]

        // handle projection by augmenting the keys to pick
        if (select && select.length) {
            const omitKeys = select.filter((key) => key.startsWith('-')).map((key) => key.substr(1));
            const pickKeys = select.filter((key) => !key.startsWith('-'));

            if (omitKeys.length) {
                keys = keys.filter((key) => !omitKeys.includes(key));
                attributeKeys = attributeKeys.filter((key) => !omitKeys.includes(key));
            }
            else if (pickKeys.length) {
                keys = keys.filter((key) => pickKeys.includes(key));
                attributeKeys = attributeKeys.filter((key) => pickKeys.includes(key));
            }
        }

        const attributes: Partial<Viking['broadcast']['attributes']> = [];

        if (attributeKeys.includes('beard_name')) {
            attributes.push({
                trait_type: 'Beard',
                value: data.beard_name
            });
        }
        if (attributeKeys.includes('body_name')) {
            attributes.push({
                trait_type: 'Body',
                value: data.body_name
            });
        }
        if (attributeKeys.includes('face_name')) {
            attributes.push({
                trait_type: 'Face',
                value: data.face_name
            });
        }
        if (attributeKeys.includes('top_name')) {
            attributes.push({
                trait_type: 'Top',
                value: data.top_name
            });
        }

        if (attributeKeys.includes('boots_name')) {
            attributes.push({
                trait_type: 'Boots Type',
                value: data.boots_name
            });
        }
        if (attributeKeys.includes('boots_condition')) {
            attributes.push({
                trait_type: 'Boots Condition',
                value: data.boots_condition
            });
        }
        if (attributeKeys.includes('speed')) {
            attributes.push({
                trait_type: 'Speed',
                value: data.speed,
                max_value: 99
            });
        }

        if (attributeKeys.includes('bottoms_name')) {
            attributes.push({
                trait_type: 'Bottoms Type',
                value: data.bottoms_name
            });
        }
        if (attributeKeys.includes('bottoms_condition')) {
            attributes.push({
                trait_type: 'Bottoms Condition',
                value: data.bottoms_condition
            });
        }
        if (attributeKeys.includes('stamina')) {
            attributes.push({
                trait_type: 'Stamina',
                value: data.stamina,
                max_value: 99
            });
        }

        if (attributeKeys.includes('helmet_name')) {
            attributes.push({
                trait_type: 'Helmet Type',
                value: data.helmet_name
            });
        }
        if (attributeKeys.includes('helmet_condition')) {
            attributes.push({
                trait_type: 'Helmet Condition',
                value: data.helmet_condition
            });
        }
        if (attributeKeys.includes('intelligence')) {
            attributes.push({
                trait_type: 'Intelligence',
                value: data.intelligence,
                max_value: 99
            });
        }

        if (attributeKeys.includes('shield_name')) {
            attributes.push({
                trait_type: 'Shield Type',
                value: data.shield_name
            });
        }
        if (attributeKeys.includes('shield_condition')) {
            attributes.push({
                trait_type: 'Shield Condition',
                value: data.shield_condition
            });
        }
        if (attributeKeys.includes('defence')) {
            attributes.push({
                trait_type: 'Defence',
                value: data.defence,
                max_value: 99
            });
        }

        if (attributeKeys.includes('weapon_name')) {
            attributes.push({
                trait_type: 'Weapon Type',
                value: data.weapon_name
            });
        }
        if (attributeKeys.includes('weapon_condition')) {
            attributes.push({
                trait_type: 'Weapon Condition',
                value: data.weapon_condition
            });
        }
        if (attributeKeys.includes('attack')) {
            attributes.push({
                trait_type: 'Attack',
                value: data.attack,
                max_value: 99
            });
        }

        let transformed = Object.assign(
            {},
            _pick(data, keys)
        );

        if (keys.includes('image')) {
            transformed = Object.assign(transformed, { image: VikingHelper.getVikingImageUrl(data.image) });
        }
        if (keys.includes('texture')) {
            transformed = Object.assign(transformed, { texture: VikingHelper.getTextureImageUrl(data.texture) });
        }

        if (!select || select?.includes('external_link')) {
            transformed = Object.assign(transformed, { external_link: VikingHelper.getVikingExternalURL(data.number) });
        }

        if (attributes.length) {
            transformed = Object.assign(transformed, { attributes });
        }

        return transformed;
    }

    /**
     * Build a Viking Image URL for a given file name
     *
     * @param fileName the name of the file
     *
     * @returns the Viking Image URL
     */
    public static getVikingImageUrl(fileName: string): string {
        return `${VikingHelper.VIKING_IMAGE_BASE_URL}/${fileName}.png`
    }

    /**
     * Build a Texture Image URL for a given file name
     *
     * @param fileName the name of the file
     *
     * @returns the Texture Image URL
     */
    public static getTextureImageUrl(fileName: string): string {
        return `${VikingHelper.TEXTURE_IMAGE_BASE_URL}/${fileName}.png`
    }

    /**
     * Build a Viking External URL for a given URI
     *
     * @param resource the name of the resource to include in the URL
     *
     * @returns the Viking External URL
     */
    public static getVikingExternalURL(resource: string | number): string {
        return `${VikingHelper.VIKING_LINK_BASE_URL}/${resource}`;
    }
}
