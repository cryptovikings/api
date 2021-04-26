import { ClothesCondition } from '../../enums/clothesCondition.enum';
import { ItemCondition } from '../../enums/itemCondition.enum';


/**
 * Model representing the collection of Asset Names and Conditions inferred based on Viking Contract Data and used by the MetadataHelper and
 *   ImageHelper
 *
 * Intermediate transformed data type
 */
export interface NewAssetSpecs {
    number: number;
    names: {
        beard: string;
        body: string;
        boots: string;
        bottoms: string;
        face: string;
        helmet: string;
        shield: string;
        top: string;
        weapon: string;
    };
    conditions: {
        boots: ClothesCondition;
        bottoms: ClothesCondition;
        helmet: ItemCondition;
        shield: ItemCondition;
        weapon: ItemCondition;
    };
    stats: {
        attack: number;
        defence: number;
        intelligence: number;
        speed: number;
        stamina: number;
    };
    filePaths: {
        beard: string;
        body: string;
        face: string;
        top: string;
        boots: string;
        bottoms: string;
        helmet?: string;
        shield?: string;
        weapon?: string;
    };
}

export interface AssetSpecs {
    names: {
        beard: string;
        body: string;
        boots: string;
        bottoms: string;
        face: string;
        helmet: string;
        shield: string;
        top: string;
        weapon: string;
    };
    conditions: {
        boots: ClothesCondition;
        bottoms: ClothesCondition;
        helmet: ItemCondition;
        shield: ItemCondition;
        weapon: ItemCondition;
    };
}
