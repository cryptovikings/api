import { BigNumber } from 'ethers';

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

export interface VikingConditions {
    boots: ClothesCondition;
    bottoms: ClothesCondition;
    helmet: ItemCondition;
    shield: ItemCondition;
    weapon: ItemCondition;
}
