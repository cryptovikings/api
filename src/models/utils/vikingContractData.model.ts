import { BigNumber } from '@ethersproject/bignumber';

/**
 * Interface representing the Viking Contract Data Storage format, retrieved from the Contract as the source of truth for local Viking generation
 */
export interface VikingContractData {
    /** 8-digit 4-component Beard+Body+Face+Top style selectors - 0 -> 99 each */
    readonly appearance: BigNumber;

    /** Boots style selector - 0 -> 99 */
    readonly boots: BigNumber;
    /** Speed statistic + Boots Condition selector - 0 -> 99 */
    readonly speed: BigNumber;

    /** Bottoms style selector - 0 -> 99 */
    readonly bottoms: BigNumber;
    /** Stamina statistic + Bottoms Condition selector - 0 -> 99 */
    readonly stamina: BigNumber;

    /** Helmet style selector - 0 -> 99 */
    readonly helmet: BigNumber;
    /** Intelligence statistic + Helmet Condition selector - 0 -> 99 */
    readonly intelligence: BigNumber;

    /** Shield style selector - 0 -> 99 */
    readonly shield: BigNumber;
    /** Defence statistic + Shield Condition selector - 0 -> 99 */
    readonly defence: BigNumber;

    /** Weapon style selector - 0 -> 99 */
    readonly weapon: BigNumber;
    /** Attack statistic + Weapon Condition selector - 0 -> 99 */
    readonly attack: BigNumber;
}
