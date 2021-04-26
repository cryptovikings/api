import { BigNumber } from '@ethersproject/bignumber';
import { VikingContractModel } from '../models/viking/vikingContract.model';

/**
 * TestHelper, containing temporary/test Helper functionality for use only in achieving internal functionality tests in TestController
 *
 * As with TestController, **NOT** for production use, only for dev and staging tests
 */
export class TestHelper {

    /**
     * Off-chain TEST Viking Contract Data generator, enabling the testing of Viking Generation without the back-and-forth with Contract Events
     *
     * @returns an emulated VikingContractModel
     */
    public static generateVikingContractData(): VikingContractModel {
        // random number generator, producing BigNumbers for ContractModel compatibility
        const random = (max: number): BigNumber => BigNumber.from(Math.round(Math.random() * (max - 1) + 1));

        const beard = random(89).add(10);
        const body = random(99);
        const face = random(99);
        const top = random(99);

        // build the 8-digit Appearance number from the beard + body + face + top components
        const appearance = BigNumber.from(
            // eslint-disable-next-line
            `${beard.toString()}${body.lt(10) ? `0${body.toString()}` : body.toString()}${face.lt(10) ? `0${face.toString()}` : face.toString()}${top.lt(10) ? `0${top.toString()}` : top.toString()}`
        );

        // build the ContractModel compatible representation
        return {
            appearance,

            boots: random(99),
            speed: random(99),

            bottoms: random(99),
            stamina: random(99),

            helmet: random(99),
            intelligence: random(99),

            shield: random(99),
            defence: random(99),

            weapon: random(99),
            attack: random(99)
        };
    }
}
