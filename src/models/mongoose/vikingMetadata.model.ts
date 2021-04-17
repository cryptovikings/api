import { ModelDocument, ModelSchema, _createSchema } from './base.model';
import mongoose, { Schema } from 'mongoose';
import { ItemCondition } from '../../utils/itemCondition.enum';

/**
 * Model representing the Viking Metadata that will be generated and provided to OpenSea for Viking listings
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

export interface VikingMetadataSchema extends ModelSchema, VikingMetadata { }

export interface VikingMetadataDocument extends ModelDocument, VikingMetadata { }

const VikingMetadataSchema = _createSchema({
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },
    external_link: { type: String, required: true },
    image: { type: String, required: true },
    attributes: [{ type: Schema.Types.Mixed, required: true }]
});

export const VikingMetaDataModel = mongoose.model('VikingMetadata', VikingMetadataSchema, 'vikingmetadata');
