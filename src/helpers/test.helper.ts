import { BigNumber } from '@ethersproject/bignumber';
import { VikingComponents, VikingConditions, VikingStats } from '../models/viking/vikingStructs.model';

/**
 * Convenience interface for packing generateVikingContractData() return into an object
 */
interface VikingContractData {
    stats: VikingStats;
    components: VikingComponents;
    conditions: VikingConditions;
}

/**
 * TestHelper, containing temporary/test functionality for use only in achieving internal functionality tests in TestController
 *
 * Reimplements/mirrors the functionality found in the NornirResolver so as to avoid needing to communicate with that for things like local test generations
 */
export class TestHelper {

    /**
     * Simple random number generator for testing
     *
     * @param max the inclusive maximum
     *
     * @returns a random number
     */
    public static random(max: number): number {
        return Math.round(Math.random() * (max - 1) + 1);
    }

    /**
     * Generate a Contract-compatible Viking representation using local mirrors of the NornirResolver's functionality and a simple RNG
     *
     * Used for testing local Viking generations without want or need of communication with the Contract(s)
     *
     * @param number the ID of the Viking to generate
     *
     * @returns the VikingContractData
     */
    public static generateVikingContractData(number: number): VikingContractData {
        const random = (max: number): BigNumber => BigNumber.from(TestHelper.random(max));

        const beard = random(89).add(10);
        const body = random(99);
        const face = random(99);
        const top = random(99);

        const stats: VikingStats = {
            name: `Viking #${number}`,
            boots: random(99),
            bottoms: random(99),
            helmet: random(99),
            shield: random(99),
            weapon: random(99),
            attack: random(99),
            defence: random(99),
            intelligence: random(99),
            speed: random(99),
            stamina: random(99),
            appearance: BigNumber.from(
                // eslint-disable-next-line
                `${beard.toString()}${body.lt(10) ? `0${body.toString()}` : body.toString()}${face.lt(10) ? `0${face.toString()}` : face.toString()}${top.lt(10) ? `0${top.toString()}` : top.toString()}`
            )
        };

        const conditions: VikingConditions = {
            boots: TestHelper.resolveClothesCondition(stats.speed.toNumber()),
            bottoms: TestHelper.resolveClothesCondition(stats.stamina.toNumber()),
            helmet: TestHelper.resolveItemCondition(stats.intelligence.toNumber()),
            shield: TestHelper.resolveItemCondition(stats.defence.toNumber()),
            weapon: TestHelper.resolveItemCondition(stats.weapon.toNumber()),
        };

        const components: VikingComponents = {
            beard: TestHelper.resolveBeard(beard.toNumber()),
            body: TestHelper.resolveBody(body.toNumber()),
            face: TestHelper.resolveFace(face.toNumber()),
            top: TestHelper.resolveTop(top.toNumber()),
            boots: TestHelper.resolveBoots(stats.boots.toNumber(), conditions.boots),
            bottoms: TestHelper.resolveBottoms(stats.bottoms.toNumber(), conditions.bottoms),
            helmet: TestHelper.resolveHelmet(stats.helmet.toNumber(), conditions.helmet),
            shield: TestHelper.resolveShield(stats.shield.toNumber(), conditions.shield),
            weapon: TestHelper.resolveWeapon(stats.weapon.toNumber(), conditions.weapon)
        };

        return {
            stats,
            components,
            conditions
        };
    }

    /**
     * Mirror of NornirResolver's resolveClothesCondition
     */
    private static resolveClothesCondition(stat: number): ClothesCondition {
        // 10%
        if (stat <= 9) {
            return 'Standard';
        }

        // 30%
        if (stat <= 39) {
            return 'Ragged';
        }

        // 25%
        if (stat <= 64) {
            return 'Rough';
        }

        // 20%
        if (stat <= 84) {
            return 'Used';
        }

        // 10%
        if (stat <= 94) {
            return 'Good';
        }

        // 5%
        return 'Perfect';
    }

    /**
     * Mirror of NornirResolver's resolveItemCondition
     */
    private static resolveItemCondition(stat: number): ItemCondition {
        // 10%
        if (stat <= 9) {
            return 'None';
        }

        // 30%
        if (stat <= 39) {
            return 'Destroyed';
        }

        // 25%
        if (stat <= 64) {
            return 'Battered';
        }

        // 20%
        if (stat <= 84) {
            return 'War Torn';
        }

        // 10%
        if (stat <= 94) {
            return 'Battle Ready';
        }

        // 5%
        return 'Flawless';
    }

    /**
     * Mirror of NornirResolver's resolveBeard
     */
    private static resolveBeard(selector: number): string {
        // 20% (18 / 90)
        if (selector <= 27) {
            return 'Stubble';
        }

        // 20% (18 / 90)
        if (selector <= 45) {
            return 'Trim';
        }

        // ~15.56% (14 / 90)
        if (selector <= 59) {
            return 'Bushy';
        }

        // ~14.43% (13 / 90)
        if (selector <= 72) {
            return 'Beaded';
        }

        // 10% (9 / 90)
        if (selector <= 81) {
            return 'Straggly';
        }

        // 10% (9 / 90)
        if (selector <= 90) {
            return 'Goatee';
        }

        // ~6.67% (6 / 90)
        if (selector <= 96) {
            return 'Slick';
        }

        // 3.32%% (3 / 90)
        return 'Sophisticated';
    }

    /**
     * Mirror of NornirResolver's resolveBody
     */
    private static resolveBody(selector: number): string {
        // 13%
        if (selector <= 12) {
            return 'Base 1';
        }

        // 13%
        if (selector <= 25) {
            return 'Base 2';
        }

        // 13%
        if (selector <= 38) {
            return 'Base 3';
        }

        // 13%
        if (selector <= 51) {
            return 'Tatted';
        }

        // 11%
        if (selector <= 62) {
            return 'Inked';
        }

        // 9%
        if (selector <= 71) {
            return 'Devil';
        }

        // 9%
        if (selector <= 80) {
            return 'Zombie (Green)';
        }

        // 7%
        if (selector <= 87) {
            return 'Pigman';
        }

        // 6%
        if (selector <= 93) {
            return 'Robot';
        }

        // 4%
        if (selector <= 97) {
            return 'Zombie (Blue)';
        }

        // 2%
        return 'Wolfman';
    }

    /**
     * Mirror of NornirResolver's resolveFace
     */
    private static resolveFace(selector: number): string {
        // 15%
        if (selector <= 14) {
            return 'Smirk';
        }

        // 15%
        if (selector <= 29) {
            return 'Stern';
        }

        // 15%
        if (selector <= 44) {
            return 'Grin';
        }

        // 12%
        if (selector <= 56) {
            return 'Angry';
        }

        // 10%
        if (selector <= 66) {
            return 'Singer';
        }

        // 10%
        if (selector <= 76) {
            return 'Worried';
        }

        // 8%
        if (selector <= 84) {
            return 'Fangs';
        }

        // 7%
        if (selector <= 91) {
            return 'Patch';
        }

        // 5%
        if (selector <= 96) {
            return 'Cyclops';
        }

        // 3%
        return 'Cool';
    }

    /**
     * Mirror of NornirResolver's resolveTop
     */
    private static resolveTop(selector: number): string {
        // 10%
        if (selector <= 9) {
            return 'Tattered (Blue)';
        }

        // 10%
        if (selector <= 19) {
            return 'Strap';
        }

        // 8%
        if (selector <= 27) {
            return 'Tattered (Grey)';
        }

        // 8%
        if (selector <= 35) {
            return 'Gorget';
        }

        // 7%
        if (selector <= 42) {
            return 'Tattered (Red)';
        }

        // 7%
        if (selector <= 49) {
            return 'V Neck (Pink)';
        }

        // 7%
        if (selector <= 56) {
            return 'Shirt (Grey)';
        }

        // 6%
        if (selector <= 62) {
            return 'Traditional';
        }

        // 5%
        if (selector <= 67) {
            return 'V Neck (Blue)';
        }

        // 5%
        if (selector <= 72) {
            return 'Shirt (Red)';
        }

        // 4%
        if (selector <= 76) {
            return 'Jacket (Pink)';
        }

        // 4%
        if (selector <= 80) {
            return 'Jacket (Grey)';
        }

        // 4%
        if (selector <= 84) {
            return 'Vest (Green)';
        }

        // 4%
        if (selector <= 88) {
            return 'Vest (Pink)';
        }

        // 3%
        if (selector <= 91) {
            return 'V Neck (Grey)';
        }

        // 3%
        if (selector <= 94) {
            return 'Shirt (Blue)';
        }

        // 2%
        if (selector <= 96) {
            return 'Jacket (Purple)';
        }

        // 2%
        if (selector <= 98) {
            return 'Vest (Yellow)';
        }

        // 1%
        return 'Pendant';
    }

    /**
     * Mirror of NornirResolver's resolveBoots
     */
    private static resolveBoots(selector: number, condition: string): string {
        // (10%)
        if (condition === 'Standard') return condition;

        // 30% (28% overall)
        if (selector <= 29) {
            return 'Leather';
        }

        // 25% (23% overall)
        if (selector <= 54) {
            return 'Laced';
        }

        // 25% (23% overall)
        if (selector <= 79) {
            return 'Sandals';
        }

        // 12% (10% overall)
        if (selector <= 91) {
            return 'Tailored';
        }

        // 8% (6% overall)
        return 'Steel Capped';
    }

    /**
     * Mirror of NornirResolver's resolveBottoms
     */
    private static resolveBottoms(selector: number, condition: string): string {
        // (10%)
        if (condition === 'Standard') return condition;

        // 30% (28% overall)
        if (selector <= 29) {
            return 'Shorts';
        }

        // 25% (23% overall)
        if (selector <= 54) {
            return 'Buckled';
        }

        // 25% (23% overall)
        if (selector <= 79) {
            return 'Patchwork';
        }

        // 12% (10% overall)
        if (selector <= 91) {
            return 'Short Shorts';
        }

        // 8% (6% overall)
        return 'Kingly';
    }

    /**
     * Mirror of NornirResolver's resolveHelmet
     */
    private static resolveHelmet(selector: number, condition: string): string {
        // (10%)
        if (condition === 'None') return condition;

        // 30% (28% overall)
        if (selector <= 29) {
            return 'Cap';
        }

        // 25% (23% overall)
        if (selector <= 54) {
            return 'Horned';
        }

        // 25% (23% overall)
        if (selector <= 79) {
            return 'Headband';
        }

        // 12% (10% overall)
        if (selector <= 91) {
            return 'Spiky';
        }

        // 8% (6% overall)
        return 'Bejeweled';
    }

    /**
     * Mirror of NornirResolver's resolveShield
     */
    private static resolveShield(selector: number, condition: string): string {
        // (10%)
        if (condition === 'None') return condition;

        // 30% (28% overall)
        if (selector <= 29) {
            return 'Wooden';
        }

        // 25% (23% overall)
        if (selector <= 54) {
            return 'Ornate';
        }

        // 25% (23% overall)
        if (selector <= 79) {
            return 'Scutum';
        }

        // 12% (10% overall)
        if (selector <= 91) {
            return 'Reinforced';
        }

        // 8% (6% overall)
        return 'Bones';
    }

    /**
     * Mirror of NornirResolver's resolveWeapon
     */
    private static resolveWeapon(selector: number, condition: string): string {
        // (10%)
        if (condition === 'None') return condition;

        // 23% (~21.572% overall)
        if (selector <= 22) {
            return 'Axe';
        }

        // 20% (~18.572% overall))
        if (selector <= 42) {
            return 'Trident';
        }

        // 18% (~16.572% overall)
        if (selector <= 60) {
            return 'Plank';
        }

        // 16% (~14.572% overall)
        if (selector <= 76) {
            return 'Sword';
        }

        // 12% (~10.572% overall)
        if (selector <= 88) {
            return 'Bow';
        }

        // 7% (~5.572% overall)
        if (selector < 95) {
            return 'Bat';
        }

        // 4% (~2.572% overall)
        return 'Hammer';
    }
}
