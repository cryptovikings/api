import { BigNumber } from '@ethersproject/bignumber';

/**
 * Interface representing the Viking Contract Data Storage format, retrieved from the Contract as the source of truth for local Viking generation
 */
export interface VikingContractData {
    /** 8-digit 4-component Beard+Body+Face+Top style selectors - 0 -> 99 each */
    appearance: BigNumber;

    /** Boots style selector - 0 -> 99 */
    boots: BigNumber;
    /** Speed statistic + Boots Condition selector - 0 -> 99 */
    speed: BigNumber;

    /** Bottoms style selector - 0 -> 99 */
    bottoms: BigNumber;
    /** Stamina statistic + Bottoms Condition selector - 0 -> 99 */
    stamina: BigNumber;

    /** Helmet style selector - 0 -> 99 */
    helmet: BigNumber;
    /** Intelligence statistic + Helmet Condition selector - 0 -> 99 */
    intelligence: BigNumber;

    /** Shield style selector - 0 -> 99 */
    shield: BigNumber;
    /** Defence statistic + Shield Condition selector - 0 -> 99 */
    defence: BigNumber;

    /** Weapon style selector - 0 -> 99 */
    weapon: BigNumber;
    /** Attack statistic + Weapon Condition selector - 0 -> 99 */
    attack: BigNumber;
}
