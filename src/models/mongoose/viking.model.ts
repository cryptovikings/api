import { ModelBroadcast, ModelRead, ModelWrite, _createModel } from './base.model';
import { ItemCondition } from '../../utils/itemCondition.enum';
import { ClothesCondition } from '../../utils/clothesCondition.enum';

interface Viking {
    number: number;

    name: string;
    image: string;
    description: string;

    birthday: number;

    beard_name: string;
    body_name: string;
    face_name: string;
    top_name: string;

    boots_name: string;
    boots_condition: ClothesCondition;
    speed: number;

    bottoms_name: string;
    bottoms_condition: ClothesCondition;
    stamina: number;

    helmet_name: string;
    helmet_condition: ItemCondition;
    intelligence: number;

    shield_name: string;
    shield_condition: ItemCondition;
    defence: number;

    weapon_name: string;
    weapon_condition: ItemCondition;
    attack: number;
}

interface VikingMetadata {
    name: string;
    image: string;
    description: string;
    external_link: string;

    attributes: [
        // birthday
        {
            display_type: 'date';
            trait_type: 'Birthday';
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
            value: ClothesCondition
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
            value: ClothesCondition
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
 * 'Writeable' type for Viking, extending the base ModelWrite
 */
export interface VikingWrite extends ModelWrite, Viking { }

/**
 * 'Readable' type for Viking, extending the base ModelRead
 */
export interface VikingRead extends ModelRead, Viking { }

/**
 * 'Broadcast' type for Viking, extending the base ModelBroadcast
 */
export interface VikingBroadcast extends ModelBroadcast, VikingMetadata { }

/**
 * Mongoose PaginateModel for the VikingMetadata collection
 */
export const VikingModel = _createModel({
    name: 'Viking',
    schemaDefinition: {
        number: { type: Number, required: true, unique: true, index: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        description: { type: String, required: true },
        birthday: { type: Number, required: true },

        beard_name: { type: String, required: true },
        body_name: { type: String, required: true },
        face_name: { type: String, required: true },
        top_name: { type: String, required: true },

        boots_name: { type: String, required: true },
        boots_condition: { type: String, required: true, enum: ClothesCondition },
        speed: { type: Number, required: true },

        bottoms_name: { type: String, required: true },
        bottoms_condition: { type: String, required: true, enum: ClothesCondition },
        stamina: { type: Number, required: true },

        helmet_name: { type: String, required: true },
        helmet_condition: { type: String, required: true, enum: ItemCondition },
        intelligence: { type: Number, required: true },

        shield_name: { type: String, required: true },
        shield_condition: { type: String, required: true, enum: ItemCondition },
        defence: { type: Number, required: true },

        weapon_name: { type: String, required: true },
        weapon_condition: { type: String, required: true, enum: ItemCondition },
        attack: { type: Number, required: true },
    }
});
