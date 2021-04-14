/**
 * Interface representing the Viking data that will be received in relation to a given NFT
 */
export interface Viking {
    /** Name */
    name: string;

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

    /** Weapon type (style) */
    /** Attack statistic (implying Weapon Condition) */
    appearance: number;
}
