import { ClothesCondition } from '../../enums/clothesCondition.enum';
import { ItemCondition } from '../../enums/itemCondition.enum';

/**
 * Intermediate data format containing all the information required to generate Viking Database Data + Viking Images
 *
 * Produced based directly off Viking Contract Data by consistent selection algorithms
 *
 * Contains information on:
 *     - the Viking's Number (Contract/NFT ID)
 *     - the Viking's Image URL
 *     - Part Type Names
 *     - Item/Clothing Conditions
 *     - Statistics
 *     - File Paths for each part
 */
export interface AssetSpecs {
    number: number;
    imageUrl: string;
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
