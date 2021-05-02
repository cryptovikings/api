import { APIModel, ModelBroadcast, ModelRead, ModelWrite, _createModel } from '../base.model';
import { ItemCondition } from '../../enums/itemCondition.enum';
import { ClothesCondition } from '../../enums/clothesCondition.enum';

/**
 * Local Viking Storage format to be used as the basis for Viking Read + Write models
 */
interface VikingStore {
    readonly number: number;

    readonly name: string;
    readonly image: string;
    readonly description: string;

    readonly beard_name: string;
    readonly body_name: string;
    readonly face_name: string;
    readonly top_name: string;

    readonly boots_name: string;
    readonly boots_condition: ClothesCondition;
    readonly speed: number;

    readonly bottoms_name: string;
    readonly bottoms_condition: ClothesCondition;
    readonly stamina: number;

    readonly helmet_name: string;
    readonly helmet_condition: ItemCondition;
    readonly intelligence: number;

    readonly shield_name: string;
    readonly shield_condition: ItemCondition;
    readonly defence: number;

    readonly weapon_name: string;
    readonly weapon_condition: ItemCondition;
    readonly attack: number;
}

/**
 * Viking Metadata (OpenSea) format to be used as the basis for Viking Broadcast model
 */
interface VikingMetadata {
    readonly name: string;
    readonly image: string;
    readonly description: string;
    readonly external_link: string;

    readonly attributes: [
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
interface VikingWrite extends ModelWrite, VikingStore { }

/**
 * 'Readable' type for Viking, extending the base ModelRead
 */
interface VikingRead extends ModelRead, VikingStore { }

/**
 * 'Broadcast' type for Viking, extending the base ModelBroadcast
 */
interface VikingBroadcast extends ModelBroadcast, VikingMetadata { }

/**
 * Packed Model supertype for Viking
 */
export interface Viking extends APIModel<VikingWrite, VikingRead, VikingBroadcast> { }

/**
 * Mongoose PaginateModel for the VikingMetadata collection, based on the VikingWrite/Read model
 */
export const VikingModel = _createModel({
    name: 'Viking',
    readonly: true,
    readonlyOverrides: ['name'],
    schemaDefinition: {
        number: { type: Number, required: true, unique: true, index: true },
        name: { type: String, required: true, unique: true, index: true },
        image: { type: String, required: true, unique: true },
        description: { type: String, required: true },

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
