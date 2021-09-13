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

        // 40%
        if (stat <= 49) {
            return 'Ragged';
        }

        // 25%
        if (stat <= 74) {
            return 'Rough';
        }

        // 15%
        if (stat <= 89) {
            return 'Used';
        }

        // 7%
        if (stat <= 96) {
            return 'Good';
        }

        // 3%
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

        // 40%
        if (stat <= 49) {
            return 'Destroyed';
        }

        // 25%
        if (stat <= 74) {
            return 'Battered';
        }

        // 15%
        if (stat <= 89) {
            return 'War Torn';
        }

        // 7%
        if (stat <= 96) {
            return 'Battle Ready';
        }

        // 3%
        return 'Flawless';
    }

    /**
     * Mirror of NornirResolver's resolveBeard
     */
    private static resolveBeard(selector: number): string {
        // 20%
        if (selector <= 27) {
            return 'Stubble';
        }

        // 20%
        if (selector <= 45) {
            return 'Trim';
        }

        // 20%
        if (selector <= 63) {
            return 'Bushy';
        }

        // 10%
        if (selector <= 72) {
            return 'Beaded';
        }

        // 10%
        if (selector <= 81) {
            return 'Straggly';
        }

        // 10%
        if (selector <= 90) {
            return 'Goatee';
        }

        // ~6.7%
        if (selector <= 96) {
            return 'Slick';
        }

        // ~3.3%
        return 'Sophisticated';
    }

    /**
     * Mirror of NornirResolver's resolveBody
     */
    private static resolveBody(selector: number): string {
        // 20%
        if (selector <= 19) {
            return 'Base 1';
        }

        // 20%
        if (selector <= 39) {
            return 'Base 2';
        }

        // 20%
        if (selector <= 59) {
            return 'Base 3';
        }

        // 10%
        if (selector <= 69) {
            return 'Inked';
        }

        // 10%
        if (selector <= 79) {
            return 'Tatted';
        }

        // 5%
        if (selector <= 84) {
            return 'Devil';
        }

        // 5%
        if (selector <= 89) {
            return 'Zombie (Green)';
        }

        // 4%
        if (selector <= 93) {
            return 'Pigman';
        }

        // 3%
        if (selector <= 96) {
            return 'Robot';
        }

        // 2%
        if (selector <= 98) {
            return 'Zombie (Blue)';
        }

        // 1%
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

        // 13%
        if (selector <= 42) {
            return 'Worried';
        }

        // 12%
        if (selector <= 54) {
            return 'Angry';
        }

        // 10%
        if (selector <= 64) {
            return 'Singer';
        }

        // 10%
        if (selector <= 74) {
            return 'Grin';
        }

        // 10%
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
        /* Tattered - 30% overall */
        // 6%
        if (selector <= 5) {
            return 'Tattered (Blue)';
        }

        // 6%
        if (selector <= 11) {
            return 'Tattered (Dark Grey)';
        }

        // 6%
        if (selector <= 17) {
            return 'Tattered (Light Grey)';
        }

        // 6%
        if (selector <= 23) {
            return 'Tattered (Purple)';
        }

        // 4%
        if (selector <= 27) {
            return 'Tattered (Red)';
        }

        // 2%
        if (selector <= 29) {
            return 'Tattered (Yellow)';
        }

        /* Tank Top - 20% overall */
        // 4%
        if (selector <= 33) {
            return 'Tank Top (Blue)';
        }

        // 4%
        if (selector <= 37) {
            return 'Tank Top (Dark Grey)';
        }

        // 4%
        if (selector <= 41) {
            return 'Tank Top (Green)';
        }

        // 3%
        if (selector <= 44) {
            return 'Tank Top (Light Grey)';
        }

        // 3%
        if (selector <= 47) {
            return 'Tank Top (Pink)';
        }

        // 2%
        if (selector <= 49) {
            return 'Tank Top (Red)';
        }

        /* Vest - 20% overall */
        // 5%
        if (selector <= 54) {
            return 'Vest (Blue)';
        }

        // 5%
        if (selector <= 59) {
            return 'Vest (Green)';
        }

        // 5%
        if (selector <= 64) {
            return 'Vest (Pink)';
        }

        // 3%
        if (selector <= 67) {
            return 'Vest (White)';
        }

        // 2%
        if (selector <= 69) {
            return 'Vest (Yellow)';
        }

        /* Winter Jacket - 15% overall */
        // 3%
        if (selector <= 72) {
            return 'Winter Jacket (Blue)';
        }

        // 3%
        if (selector <= 75) {
            return 'Winter Jacket (Dark Grey)';
        }

        // 3%
        if (selector <= 78) {
            return 'Winter Jacket (Green)';
        }

        // 2%
        if (selector <= 80) {
            return 'Winter Jacket (Light Grey)';
        }

        // 2%
        if (selector <= 82) {
            return 'Winter Jacket (Pink)';
        }

        // 2%
        if (selector <= 84) {
            return 'Winter Jacket (Purple)';
        }

        /* Fitted Shirt - 10% overall */
        // 2%
        if (selector <= 86) {
            return 'Fitted Shirt (Blue)';
        }

        // 2%
        if (selector <= 88) {
            return 'Fitted Shirt (Green)';
        }

        // 2%
        if (selector <= 90) {
            return 'Fitted Shirt (Grey)';
        }

        // 2%
        if (selector <= 92) {
            return 'Fitted Shirt (Pink)';
        }

        // 1%
        if (selector <= 93) {
            return 'Fitted Shirt (Red)';
        }

        // 1%
        if (selector <= 94) {
            return 'Fitted Shirt (Yellow)';
        }

        /* Strapped - 5% */
        return 'Strapped';
    }

    /**
     * Mirror of NornirResolver's resolveBoots
     */
    private static resolveBoots(selector: number, condition: string): string {
        if (condition === 'Standard') return condition;

        // 35%
        if (selector <= 34) {
            return 'Leather';
        }

        // 25%
        if (selector <= 59) {
            return 'Laced';
        }

        // 20%
        if (selector <= 79) {
            return 'Sandals';
        }

        // 12%
        if (selector <= 91) {
            return 'Tailored';
        }

        // 8%
        return 'Steel Capped';
    }

    /**
     * Mirror of NornirResolver's resolveBottoms
     */
    private static resolveBottoms(selector: number, condition: string): string {
        if (condition === 'Standard') return condition;

        // 35%
        if (selector <= 34) {
            return 'Shorts';
        }

        // 25%
        if (selector <= 59) {
            return 'Buckled';
        }

        // 20%
        if (selector <= 79) {
            return 'Patchwork';
        }

        // 12%
        if (selector <= 91) {
            return 'Short Shorts';
        }

        // 8%
        return 'Kingly';
    }

    /**
     * Mirror of NornirResolver's resolveHelmet
     */
    private static resolveHelmet(selector: number, condition: string): string {
        if (condition === 'None') return condition;

        // 35%
        if (selector <= 34) {
            return 'Cap';
        }

        // 25%
        if (selector <= 59) {
            return 'Horned';
        }

        // 20%
        if (selector <= 79) {
            return 'Headband';
        }

        // 12%
        if (selector <= 91) {
            return 'Spiky';
        }

        // 8%
        return 'Bejeweled';
    }

    /**
     * Mirror of NornirResolver's resolveShield
     */
    private static resolveShield(selector: number, condition: string): string {
        if (condition === 'None') return condition;

        // 35%
        if (selector <= 34) {
            return 'Wooden';
        }

        // 25%
        if (selector <= 59) {
            return 'Ornate';
        }

        // 20%
        if (selector <= 79) {
            return 'Reinforced';
        }

        // 12%
        if (selector <= 91) {
            return 'Scutum';
        }

        // 8%
        return 'Bones';
    }

    /**
     * Mirror of NornirResolver's resolveWeapon
     */
    private static resolveWeapon(selector: number, condition: string): string {
        if (condition === 'None') return condition;

        // 35%
        if (selector <= 34) {
            return 'Plank';
        }

        // 25%
        if (selector <= 59) {
            return 'Axe';
        }

        // 20%
        if (selector <= 79) {
            return 'Sword';
        }

        // 10%
        if (selector <= 89) {
            return 'Trident';
        }

        // 6%
        if (selector <= 95) {
            return 'Bat';
        }

        // 4%
        return 'Hammer';
    }
}
