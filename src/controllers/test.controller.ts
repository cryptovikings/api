import fs from 'fs';
import { Request } from 'express';

import { HttpSuccessCode } from '../enums/httpSuccessCode.enum';
import { EthHelper } from '../helpers/eth.helper';
import { ImageHelper } from '../helpers/image.helper';
import { VikingHelper } from '../helpers/viking.helper';
import { APIResponse } from '../models/utils/apiResponse.model';
import { vikingService } from '../services/viking.service';
import { AbstractController } from './abstract/abstract.controller';
import { ItemCondition } from '../enums/itemCondition.enum';
import { ClothesCondition } from '../enums/clothesCondition.enum';

/**
 * The TestController, designed to handle the /test route collection
 *
 * Implements temporary response handlers for testing internal functionality
 */
class TestController extends AbstractController {
    // currently empty

    public async makeVikings(req: Request): Promise<APIResponse<boolean>> {
        const batchSize = 9;
        const array = Array.from(new Array(parseInt(req.params.count, 10)).keys());

        let batch = 1;
        for (let i = 0; i < array.length; i += batchSize) {
            console.log(`PROCESSING BATCH ${batch} of ${array.length / batchSize}`);

            await Promise.all(array.slice(i, i + batchSize).map((n) => new Promise((resolve, reject) => {
                const data = VikingHelper.generateVikingContractData();
                EthHelper.generateViking(n, data).then(() => resolve(null), (err) => reject(err));
            })));

            batch++;
        }

        await ImageHelper.generateAtlas();

        return {
            status: HttpSuccessCode.OK,
            data: true
        };
    }

    public async statistics(req: Request): Promise<APIResponse<any>> {
        const totalVikings = await vikingService.count({});

        const itemConditions = Object.values(ItemCondition).filter((v) => v !== 'TBC');
        const clothesConditions = Object.values(ClothesCondition).filter((v) => v !== 'TBC');
        const bodyNames = ['Devil', 'Pink', 'Robot', 'White', 'Zombie'];
        const beardNames = ['01', '02', '03', '04', '05'];
        const faceNames = ['01', '02', '03', '04', '05'];
        const topNames = ['01', '02', '03', '04', '05'];
        const bootsNames = ['Basic', 'Blue', 'Green', 'Red'];
        const bottomsNames = ['Basic', 'Blue', 'Green', 'Red'];
        const helmetNames = ['None', 'Green', 'Green Horned', 'Red Horned'];
        const shieldNames = ['None', 'Placeholder'];
        const weaponNames = ['None', 'Placeholder'];

        const getCounts = async (field: string, names: Array<string>): Promise<any> => {
            const out: { [name: string]: { count: number, percent: string } } = { total: { count: 0, percent: '0' } };

            await Promise.all(names.map(async (name) => {
                const count = await vikingService.count({ [`${field}`]: name });

                out[name] = {
                    count,
                    percent: (count / totalVikings * 100).toFixed(2)
                };

                out['total'].count += count;
            }));

            out['total'].percent = (out['total'].count / totalVikings * 100).toFixed(2);

            return out;
        }

        const statDistribution = async (name: string): Promise<any> => {
            const vikings = await vikingService.findMany({}, [name]);

            const out = {
                min: 0,
                max: 0,
                average: '0'
            };
            let total = 0;

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

            out.average = (total / vikings.docs.length).toFixed(2)

            return out;
        };

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

    public async reset(req: Request): Promise<APIResponse<boolean>> {
        await vikingService.deleteMany({ readonly: true });
        fs.rmSync('out', { force: true, recursive: true });

        ImageHelper.initialize();

        return {
            status: HttpSuccessCode.OK,
            data: true
        }
    }
}

/** Export a singleton of the TestController so that we can reference its instance methods in Router configuration */
export const testController = new TestController();
