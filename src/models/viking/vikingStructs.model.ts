import { BigNumber } from 'ethers';

/**
 * Reflection of the Contract VikingStats struct containing numerical information about a Viking
 */
export interface VikingStats {
    name: string;
    boots: BigNumber;
    bottoms: BigNumber;
    helmet: BigNumber;
    shield: BigNumber;
    weapon: BigNumber;
    attack: BigNumber;
    defence: BigNumber;
    intelligence: BigNumber;
    speed: BigNumber;
    stamina: BigNumber;
    appearance: BigNumber;
}

/**
 * Reflection of the Contract VikingComponents struct containing the names of all components
 */
export interface VikingComponents {
    beard: string;
    body: string;
    face: string;
    top: string;
    boots: string;
    bottoms: string;
    helmet: string;
    shield: string;
    weapon: string;
}

/**
 * Reflection of the Contract VikingConditions struct containing the conditions of all items
 */
export interface VikingConditions {
    boots: ClothesCondition;
    bottoms: ClothesCondition;
    helmet: ItemCondition;
    shield: ItemCondition;
    weapon: ItemCondition;
}
