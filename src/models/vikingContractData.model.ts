import { BigNumber } from '@ethersproject/bignumber';

// CONTRACT STORAGE FORMAT,
//   retrieved on receipt of event `vikingGenerated`
//   used for generating STORAGE FORMAT
export interface VikingContractData {
    /** Name */
    name: string;

    /** Birthday */
    birthday: number;

    /** Weapon type (style) */
    weapon: number;
    /** Attack statistic (implying Weapon Condition) */
    attack: number;

    /** Weapon type (style) */
    shield: number;
    /** Attack statistic (implying Weapon Condition) */
    defence: number;

    /** Weapon type (style) */
    boots: number;
    /** Attack statistic (implying Weapon Condition) */
    speed: number;

    /** Weapon type (style) */
    helmet: number;
    /** Attack statistic (implying Weapon Condition) */
    intelligence: number;

    /** Weapon type (style) */
    bottoms: number;
    /** Attack statistic (implying Weapon Condition) */
    stamina: number;

    /** {beard}+{body}+{face}+{top} (style) */
    appearance: number;
}

export interface ActualVikingContractData {
    weapon: BigNumber;
    attack: BigNumber;
    shield: BigNumber;
    defence: BigNumber;
    boots: BigNumber;
    speed: BigNumber;
    helmet: BigNumber;
    intelligence: BigNumber;
    bottoms: BigNumber;
    stamina: BigNumber;
    appearance: BigNumber;
}
