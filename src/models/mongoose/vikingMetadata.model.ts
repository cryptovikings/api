import { ModelRead, ModelWrite, _createModel } from './base.model';
import { Schema } from 'mongoose';
import { ItemCondition } from '../../utils/itemCondition.enum';

/**
 * Base Model representing the Viking Metadata that will be generated based on Viking Contract Data and provided to OpenSea for Viking
 *   listings
 */
interface VikingMetadata {
    name: string;
    description: string;
    external_link: string;
    image: string;

    attributes: [
        // birthday
        {
            display_type: 'date';
            trait_type: 'Birthday';
            value: number;
        },
        // generation
        {
            display_type: 'number';
            trait_type: 'Generation';
            value: number;
        },

        // beard appearance
        {
            trait_type: 'Beard';
            value: string;
        },
        // body appearance
        {
            trait_type: 'Body';
            value: string;
        },
        // face appearance
        {
            trait_type: 'Face';
            value: string;
        },
        // top appearance
        {
            trait_type: 'Top',
            value: string;
        },

        // Boots appearance
        {
            trait_type: 'Boots Type',
            value: string;
        },
        // Boots condition
        {
            trait_type: 'Boots Condition',
            value: ItemCondition
        },
        // speed statistic
        {
            trait_type: 'Speed',
            value: number;
            max_value: 99
        },

        // Bottoms appearance
        {
            trait_type: 'Bottoms Type',
            value: string;
        },
        // Bottoms condition
        {
            trait_type: 'Bottoms Condition',
            value: ItemCondition
        },
        // stamina statistic
        {
            trait_type: 'Stamina',
            value: number;
            max_value: 99
        },

        // Helmet appearance
        {
            trait_type: 'Helmet Type',
            value: string;
        },
        // Helmet condition
        {
            trait_type: 'Helmet Condition',
            value: ItemCondition
        },
        // intelligence statistic
        {
            trait_type: 'Intelligence',
            value: number;
            max_value: 99
        },

        // Shield appearance
        {
            trait_type: 'Shield Type',
            value: string;
        },
        // Shield condition
        {
            trait_type: 'Shield Condition',
            value: ItemCondition
        },
        // defence statistic
        {
            trait_type: 'Defence',
            value: number;
            max_value: 99
        },


        // Weapon appearance
        {
            trait_type: 'Weapon Type',
            value: string;
        },
        // Weapon condition
        {
            trait_type: 'Weapon Condition',
            value: ItemCondition
        },
        // attack statistic
        {
            trait_type: 'Attack',
            value: number;
            max_value: 99
        }
    ];
}

/**
 * 'Writeable' type for VikingMetadata, extending the base ModelWrite
 */
export interface VikingMetadataWrite extends ModelWrite, VikingMetadata { }

/**
 * 'Readable' type for VikingMetadata, extending the base ModelRead
 */
export interface VikingMetadataRead extends ModelRead, VikingMetadata { }

/**
 * Mongoose PaginateModel for the VikingMetadata collection
 */
export const VikingMetaDataModel = _createModel({
    name: 'VikingMetadata',
    collectionName: 'vikingmetadata',
    schemaDefinition: {
        name: { type: String, required: true, index: true },
        description: { type: String, required: true },
        external_link: { type: String, required: true },
        image: { type: String, required: true },
        attributes: [{ type: Schema.Types.Mixed, required: true }]
    }
});
