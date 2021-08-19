import fs from 'fs';
import path from 'path';
import { Request } from 'express';

import { HttpSuccessCode } from '../enums/httpSuccessCode.enum';
import { EthHelper } from '../helpers/eth.helper';
import { ImageHelper } from '../helpers/image.helper';
import { APIResponse } from '../models/utils/apiResponse.model';
import { vikingService } from '../services/viking.service';
import { AbstractController } from './abstract/abstract.controller';
import { ItemCondition } from '../enums/itemCondition.enum';
import { ClothesCondition } from '../enums/clothesCondition.enum';
import { TestHelper } from '../helpers/test.helper';

/**
 * The TestController, designed to handle the /test route collection
 *
 * Implements temporary response handlers for testing internal functionality
 *
 * Should **NOT** be included in production builds, at least without an authentication system. For testing dev and staging builds ONLY
 *
 * Some functionality implemented here may be migrated pre-production into the wider API codebase if deemed useful
 */
class TestController extends AbstractController {

    /**
     * Custom handler for the route /test/make/:count
     *
     * Generate the specified number of Vikings by way of emulated generated Contract Data produced by the TestHelper
     *
     * Process in batches of 9 so as not to overload the CPU, just because 9 is a divisor of MAX_VIKINGS (9873), enabling easy full-scale tests
     *
     * @param req the Express Request
     *
     * @returns an APIResponse containing a success flag
     */
    public async makeVikings(req: Request): Promise<APIResponse<boolean>> {
        const batchSize = 9;
        const array = Array.from(new Array(parseInt(req.params.count, 10)).keys());

        let batch = 1;
        for (let i = 0; i < array.length; i += batchSize) {
            console.log(`PROCESSING BATCH ${batch} of ${array.length / batchSize}`);

            await Promise.all(array.slice(i, i + batchSize).map((n) => new Promise((resolve, reject) => {
                const data = TestHelper.generateVikingContractData(n);
                EthHelper.testGenerateViking(n, data).then(() => resolve(null), (err) => reject(err));
            })));

            batch++;
        }

        return {
            status: HttpSuccessCode.OK,
            data: true
        };
    }

    /**
     * Custom route handler for the route /test/atlas
     *
     * Generate a demonstration Atlas with a maximum of 12 Vikings randomly selected from the output set
     *
     * @param req the Express Request
     *
     * @returns An APIResponse containing a success flag
     */
    public async makeAtlas(req: Request): Promise<APIResponse<boolean>> {
        await ImageHelper.generateVikingAtlas(parseInt(req.params.maxVikings, 10));

        return {
            status: HttpSuccessCode.OK,
            data: true
        };
    }

    /**
     * Custom handler for the route /test/stats
     *
     * Produce a dataset analysing the distribution of Part Names, Item/Clothing Conditions, and Statistics
     *
     * Useful for verifying that the generation procedure (either emulated, or Contract-based) is working as intended in testing the full system for
     *   production readiness, as well as in ensuring that post-generation numbers all add up as expected
     *
     * @returns an APIResponse containing the analysis data
     */
    public async statistics(): Promise<APIResponse<any>> {
        // total vikings, for calculating averages and prevalence percentages
        const totalVikings = await vikingService.count({});

        // list out manually (for now) the various Part Names + Condition Names so as to functionise analysis data production
        const itemConditions = Object.values(ItemCondition).filter((v) => v !== 'TBC');
        const clothesConditions = Object.values(ClothesCondition).filter((v) => v !== 'TBC');
        const bodyNames = ['Devil', 'Pink', 'Robot', 'Tats', 'White', 'Zombie', 'Zombie2'];
        const beardNames = ['01', '02', '03', '04', '05'];
        const faceNames = ['01', '02', '03', '04', '05'];
        const topNames = Array.from(new Array(25).keys()).map((n) => n + 1 < 10 ? `0${n + 1}` : `${n + 1}`);
        const bootsNames = ['Standard', '01', '02', '03', '04', '05'];
        const bottomsNames = ['Standard', '01', '02', '03', '04', '05'];
        const helmetNames = ['None', '01', '02', '03', '04', '05'];
        const shieldNames = ['None', '01', '02', '03', '05', '05'];
        const weaponNames = ['None', '01', '02', '03', '05', '05'];

        /**
         * Internal method for producing analysis data on the prevalence of Part Names + Condition Names amongst their respective sets
         *
         * For verifying that probabilistic rarity weighting is working as intended
         *
         * @param field the name of the (Viking Database) field to analyse
         * @param names the possible names of the Part or Condition
         *
         * @returns prevalence data
         */
        const getCounts = async (field: string, names: Array<string>): Promise<any> => {
            // initialise the output with tracking fields for verifying that the counts + percentages of each possible name add up nicely
            const out: { [name: string]: { count: number, percent: string } } = {
                total: {
                    count: 0,
                    percent: '0'
                }
            };

            // process all possible names in parallel
            await Promise.all(names.map(async (name) => {
                // count the Vikings in the Database with the Part or Condition Name for the Field
                const count = await vikingService.count({ [`${field}`]: name });

                // add analysis data to the output for this name
                out[name] = {
                    count,
                    percent: (count / totalVikings * 100).toFixed(2)
                };

                // track the count on the output's total
                out['total'].count += count;
            }));

            // calculate the output's total percentage
            out['total'].percent = (out['total'].count / totalVikings * 100).toFixed(2);

            return out;
        }

        /**
         * Internal method for producing analysis data on the distribution of Statistic values
         *
         * For verifying that Statistics are fairly and evenly distributed and catching any errors in generation skewing values above the expected
         *   mean or incorrectly capping values to incorrect limits
         *
         * Expected minimum: 0
         * Expected maximum: 99
         * Expected mean average: ~50
         *
         * @param field the name of the Statistic to analyse
         *
         * @returns distribution data
         */
        const statDistribution = async (name: string): Promise<any> => {
            // get all Vikings from the database
            const vikings = await vikingService.findMany({}, [name]);

            // initialise output data
            const out = {
                min: 0,
                max: 0,
                average: '0'
            };
            let total = 0;

            // iterate over all Vikings and track the Statistic's stored minimum and maximum values
            for (const v of vikings.docs) {
                const stat = v.get(name);

                if (stat < out.min) {
                    out.min = stat;
                }
                if (stat > out.max) {
                    out.max = stat;
                }

                total += stat;
            }

            // calculate the average stored Statistic Value
            out.average = (total / vikings.docs.length).toFixed(2)

            return out;
        };

        // build the analysis data
        return {
            status: HttpSuccessCode.OK,
            data: {
                attack: await statDistribution('attack'),
                defence: await statDistribution('defence'),
                intelligence: await statDistribution('intelligence'),
                stamina: await statDistribution('stamina'),
                speed: await statDistribution('speed'),
                weapon_conditions: await getCounts('weapon_condition', itemConditions),
                boots_conditions: await getCounts('boots_condition', clothesConditions),
                bottoms_conditions: await getCounts('bottoms_condition', clothesConditions),
                helmet_conditions: await getCounts('helmet_condition', itemConditions),
                shield_conditions: await getCounts('shield_condition', itemConditions),
                bodies: await getCounts('body_name', bodyNames),
                beards: await getCounts('beard_name', beardNames),
                faces: await getCounts('face_name', faceNames),
                tops: await getCounts('top_name', topNames),
                boots: await getCounts('boots_name', bootsNames),
                bottoms: await getCounts('bottoms_name', bottomsNames),
                helmets: await getCounts('helmet_name', helmetNames),
                shields: await getCounts('shield_name', shieldNames),
                weapons: await getCounts('weapon_name', weaponNames)
            }
        };
    }

    /**
     * Custom handler for the route /test/reset
     *
     * !!!DANGEROUS!!! - NOT FOR PRODUCTION
     *
     * Delete all Vikings from the Database, delete all Viking Images and reinitialize the ImageHelper
     *
     * @returns an APIResponse containing a success flag
     */
    public async reset(): Promise<APIResponse<boolean>> {
        await vikingService.deleteMany({ readonly: true });
        fs.rmSync(path.join(__dirname, '../../', process.env.IMAGE_VIKING_OUTPUT!), { force: true, recursive: true });
        fs.rmSync(path.join(__dirname, '../../', process.env.IMAGE_TEXTURE_OUTPUT!), { force: true, recursive: true });

        ImageHelper.initialize();

        return {
            status: HttpSuccessCode.OK,
            data: true
        }
    }
}

/** Export a singleton of the TestController so that we can reference its instance methods in Router configuration */
export const testController = new TestController();
