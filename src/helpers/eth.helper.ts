import fs from 'fs';
import { BigNumber, Contract, providers, Wallet } from 'ethers';
import { forever } from 'async';
import { getLogger } from 'log4js';

import nornirABI from '../nornir.abi.json';
import { vikingService } from '../services/viking.service';
import { VikingHelper } from './viking.helper';
import { ImageHelper } from './image.helper';
import { VikingComponents, VikingConditions, VikingStats } from '../models/viking/vikingStructs.model';
import { VikingSpecificationHelper } from './vikingSpecification.helper';

/**
 * // TODO
 */
interface ContractCounts {
    totalSupply: number;
    generatedVikingCount: number;
    resolvedVikingCount: number
}

/**
 * EthHelper, encapsulating all Ethereum-related functionality, including Contract instantiation and interaction, Contract data synchronization,
 *   Contract Event Listeners and a number of synchronization-related recovery routines
 */
export class EthHelper {

    /**
     * Contract Address, copied over from the environment
     */
    private static readonly CONTRACT_ADDRESS = process.env.ETH_CONTRACT_ADDRESS!;

    /**
     * Eth Provider, with URL copied over from the environment
     */
    private static readonly PROVIDER = new providers.JsonRpcProvider(process.env.ETH_PROVIDER_URL);

    /**
     * Wallet based on a secret copied over from the environment
     */
    private static readonly WALLET = process.env.ETH_WALLET_SECRET ? new Wallet(process.env.ETH_WALLET_SECRET!, EthHelper.PROVIDER) : undefined;

    /**
     * Contract instance; a NornirContract for type safety
     */
    private static readonly CONTRACT = new Contract(EthHelper.CONTRACT_ADDRESS, nornirABI, EthHelper.WALLET ?? EthHelper.PROVIDER) as NornirContract;

    /**
     * Whether or not to recover from API/Contract synchronization issues
     */
    private static readonly RECOVER = process.env.ETH_RECOVER === 'true' ?? false;

    /**
     * Whether or not to "recover" from API/Contract Viking name synchronization issues
     */
    private static readonly RECOVER_NAMES = process.env.ETH_RECOVER_NAMES === 'true' ?? false;

    /**
     * Whether or not to run Contract event listeners
     */
    private static readonly LISTEN = process.env.ETH_LISTEN === 'true' ?? false;

    /**
     * Polling Interval for Contract event listeners
     */
    private static readonly LISTENER_POLLING_INTERVAL = parseInt(process.env.ETH_LISTEN_INTERVAL!, 10);

    /**
     * Map of event name => event listener
     */
    private static readonly EVENT_MAP = {
        VikingReady: EthHelper.onVikingReady,
        VikingGenerated: EthHelper.onVikingGenerated,
        NameChange: EthHelper.onNameChange,
        VikingResolved: EthHelper.onVikingResolved
    };

    /**
     * Array to serve as an in-memory queue for generateViking call requests, avoiding a nonce conflicts for generateViking() transactions as well as
     *   completeViking() transactions by processing all TXs one at a time
     */
    private static readonly GENERATE_VIKING_CALL_QUEUE: Array<BigNumber> = [];

    // TODO
    private static readonly RESOLVE_VIKING_CALL_QUEUE: Array<BigNumber> = [];

    /**
     * Array to serve as an in-memory queue for completeViking call requests, avoiding nonce conflicts for completeViking() transactions as well as
     *   generateViking() transactions by processing all TXs one at a time
     *
     * completeViking() calls will be prioritised over generateViking() calls since they're simpler/higher priority for user experience
     */
    private static readonly COMPLETE_VIKING_CALL_QUEUE: Array<BigNumber> = [];

    /**
     * Log4js Logger
     */
    private static readonly LOGGER = getLogger();

    /**
     * Initialize by registering all event listeners if required and enacting recovery scenarios if required
     */
    public static async initialize(): Promise<void> {
        EthHelper.LOGGER.info('EthHelper [Initialize]: initializing...');

        // listen first to catch + queue any events produced by recover()
        if (EthHelper.LISTEN) {
            // register Ethereum event listeners
            EthHelper.listen();
        }
        else {
            EthHelper.LOGGER.warn('EthHelper [Initialize]: Ethereum Event Listeners disabled');
        }

        if (EthHelper.RECOVER) {
            // implement recovery scenarios
            await EthHelper.recover();
        }
        else {
            EthHelper.LOGGER.warn('EthHelper [Initialize]: Recovery mode disabled');
        }

        if (EthHelper.LISTEN) {
            // begin the event processing loop
            EthHelper.queue();
        }

        EthHelper.LOGGER.info('EthHelper [Initialize]: Initialization complete');
    }

    /**
     * Public reflection of generateViking() for use by the testController
     *
     * @param vikingId the NFT/Viking Number of the Viking to generate
     * @param vikingData the Contract Data representing the Viking
     */
    // TODO
    // public static async testGenerateViking(vikingId: number, vikingData: VikingContractModel): Promise<void> {
    //     return EthHelper.generateViking(vikingId, vikingData);
    // }

    /**
     * Configure the Provider's pollingInterval and register all Contract Event Listeners
     */
    private static listen(): void {
        // eslint-disable-next-line
        EthHelper.LOGGER.info(`EthHelper [Listen]: listening for Ethereum Events with Polling Interval [${EthHelper.LISTENER_POLLING_INTERVAL}] on [${process.env.ETH_PROVIDER_URL!}]`);

        EthHelper.PROVIDER.pollingInterval = EthHelper.LISTENER_POLLING_INTERVAL;

        for (const [event, listener] of Object.entries(EthHelper.EVENT_MAP)) {
            EthHelper.LOGGER.info(`EthHelper [Listen]: registering listener for event [${event}]`);

            EthHelper.CONTRACT.on(event, listener);
        }
    }

    /**
     * Begin an event processing queue for handling VikingComplete and VikingGenerated event responses in series, avoiding nonce conflicts in the
     *   minting procedure
     *
     * Event processing is kicked off as a last port of call in initialization so as to avoid nonce conflicts with recovery-related transactions, and
     *   so as to not accidentally miss any events while recovery proceeds, preventing a compounding recovery problem
     */
    private static queue(): void {
        EthHelper.LOGGER.info('EthHelper [Queue]: beginning Ethereum Event Queue...');

        forever(
            (next) => {
                // prioritise completeViking() calls
                const completeId = EthHelper.COMPLETE_VIKING_CALL_QUEUE.shift();

                if (completeId) {
                    EthHelper.LOGGER.info(`EthHelper [Queue]: sending completeViking call request for Viking ID ${completeId.toNumber()}`);

                    EthHelper.CONTRACT.functions.completeViking(completeId, { gasPrice: 1000000000 }).then(
                        () => {
                            next();
                        },
                        (err) => {
                            // eslint-disable-next-line
                            EthHelper.LOGGER.error(`EthHelper [Queue]: error during completeViking call request for Viking ID ${completeId.toNumber()}:`, err);

                            // do not halt execution! It is not a critical issue if we drop a completeViking call
                            next();
                        }
                    );
                }
                else {
                    // second priority: resolveViking() calls
                    const resolveId = EthHelper.RESOLVE_VIKING_CALL_QUEUE.shift();

                    if (resolveId) {
                        EthHelper.LOGGER.info(`EthHelper [Queue]: sending resolveViking call request for Viking ID ${resolveId.toNumber()}`);

                        EthHelper.CONTRACT.functions.resolveViking(resolveId, { gasPrice: 1000000000 }).then(
                            () => {
                                next();
                            },
                            (err) => {
                                // eslint-disable-next-line
                                EthHelper.LOGGER.error(`EthHelper [Queue]: error during resolveViking call request for Viking ID ${resolveId.toNumber()}:`, err);

                                // do not halt execution! It is not a critical issue if we miss a resolveViking call
                                next();
                            }
                        )
                    }
                    else {
                        // final priority: generateViking() calls
                        const generateId = EthHelper.GENERATE_VIKING_CALL_QUEUE.shift();

                        if (generateId) {
                            EthHelper.LOGGER.info(`EthHelper [Queue]: sending generateViking call request for Viking ID ${generateId.toNumber()}`);

                            EthHelper.CONTRACT.functions.generateViking(generateId, { gasPrice: 1000000000 }).then(
                                () => {
                                    next();
                                },
                                (err) => {
                                    // eslint-disable-next-line
                                    EthHelper.LOGGER.error(`EthHelper [Queue]: error during generateViking call request for Viking ID ${generateId.toNumber()}:`, err);

                                    // do not halt execution! It is not a critical issue if we miss a generateViking call
                                    next();
                                }
                            );
                        }
                        else {
                            next();
                        }
                    }
                }
            },
            (err) => {
                // this should never happen (no calls to next() with an error), but the callback is required so...
                EthHelper.LOGGER.error('EthHelper [Queue]: Ethereum Event Queue stopped:', err);
            }
        );
    }

    /**
     * Implement various initialization-time recovery scenarios, providing assurance of data integrity and synchronization between the API and the
     *   Contract
     *
     * Recovery scenarios are detected and executed in a specific order so as to optimize RPC load and API boot time
     */
    private static async recover(): Promise<void> {
        // EthHelper.LOGGER.info('EthHelper [Recover]: implementing recovery scenarios...');

        // let localVikings = await vikingService.count({});

        // const counts = await EthHelper.remoteCounts().catch((err) => {
        //     EthHelper.LOGGER.fatal('EthHelper [Recover]: error during remote count retrieval', err);

        //     // throw this error since recovery cannot continue without counts
        //     throw err;
        // });

        // EthHelper.LOGGER.info('EthHelper [Recover]: local Viking count:', localVikings);
        // EthHelper.LOGGER.info('EthHelper [Recover]: remote NFT count:', counts.totalSupply);
        // EthHelper.LOGGER.info('EthHelper [Recover]: remote Viking count:', counts.vikingCount);

        // // recovery scenario 1: local data corruption/loss or missed VikingGenerated events
        // if (localVikings !== counts.vikingCount) {
        //     EthHelper.LOGGER.warn('EthHelper [Recover]: Viking Database entries missing!');

        //     await EthHelper.synchronizeDatabase(counts.vikingCount).catch((err) => {
        //         EthHelper.LOGGER.error('EthHelper [synchronizeDatabase]: error during database synchronization', err);
        //     });

        //     // update the local viking count for the next scenario
        //     localVikings = await vikingService.count({});
        // }
        // else {
        //     EthHelper.LOGGER.info('EthHelper [Recover]: Viking Database is in sync');
        // }

        // // recovery scenario 2: local image corruption/loss or half-actioned VikingGenerated events
        // // executed after scenario 1 so that we can safely rely on database Vikings instead of remote Vikings, optimizing for reduced RPC load
        // if (fs.readdirSync(ImageHelper.VIKING_OUT).length - ImageHelper.DEFAULT_IMAGES.length < localVikings) {
        //     EthHelper.LOGGER.warn('EthHelper [Recover]: Viking Images missing!');

        //     await EthHelper.synchronizeImages(localVikings).catch((err) => {
        //         EthHelper.LOGGER.error('EthHelper [synchronizeImages]: error during image synchronization', err);
        //     });
        // }
        // else {
        //     EthHelper.LOGGER.info('EthHelper [Recover]: Viking Images are in sync');
        // }

        // // recovery scenario 3: missed VikingReady events or failed generateViking() calls
        // // executed third so as to limit back-and-forth between contract and API during hole-filling on the Contract data
        // if (counts.totalSupply !== counts.vikingCount) {
        //     EthHelper.LOGGER.warn('EthHelper [Recover]: Contract Vikings are out of sync with totalSupply()!');

        //     await EthHelper.synchronizeContract(counts.totalSupply, counts.vikingCount).catch((err) => {
        //         EthHelper.LOGGER.error('EthHelper [synchronizeContract]: error during Contract synchronization', err);
        //     });
        // }
        // else {
        //     EthHelper.LOGGER.info('EthHelper [Recover]: Contract Vikings are in sync');
        // }

        // // recovery scenario 4: missed NameChange events or otherwise out-of-sync local Viking names
        //eslint-disable-next-line
        // // executed last and triggered separately from other recovery scenarios due to RPC load issues. NameChange misses are impractical to detect,
        // //   so the routine is "dumb" in that it just retrieves *all* Vikings from the Contract so as to synchronize
        // if (EthHelper.RECOVER_NAMES) {
        //     EthHelper.LOGGER.warn('EthHelper [Recover]: synchronizing names...');

        //     await EthHelper.synchronizeNames(counts.vikingCount).catch((err) => {
        //         EthHelper.LOGGER.error('EthHelper [synchronizeNames]: error during name synchronization', err);
        //     });
        // }
    }

    /**
     * Retrieve the number of locally-stored Vikings as well as the Contract's NFT count (totalSupply()) and (generated) Viking Count
     *
     * Used to detect recovery scenarios on API initialization
     *
     * @returns the local and remote counts
     */
    private static async remoteCounts(): Promise<ContractCounts> {
        return {
            totalSupply: (await EthHelper.CONTRACT.functions.totalSupply())[0]?.toNumber(),
            generatedVikingCount: (await EthHelper.CONTRACT.functions.generatedVikingCount())[0]?.toNumber(),
            resolvedVikingCount: (await EthHelper.CONTRACT.functions.resolvedVikingCount())[0]?.toNumber()
        };
    }

    /**
     * Synchronize the local Viking database with the Contract's generated Viking set
     *
     * Fills gaps in the database by working on the knowledge that Viking IDs are sequential on the Contract side, generating any Viking with an ID
     *   in the range (0 => vikingCount) which does not have a document in the database with that ID
     *
     * @param remoteVikingCount the number of generated Vikings in the Contract's set
     */
    private static async synchronizeDatabase(remoteVikingCount: number): Promise<void> {
        // const localNumbers = (await vikingService.findMany({}, ['number'])).docs.map((v) => v.number);

        // for (let i = 0; i < remoteVikingCount; i++) {
        //     if (!localNumbers.includes(i)) {
        //         const vikingData = await EthHelper.CONTRACT.functions.vikings(i);

        //         // if the contract data is void (detectable by appearance being 0), DO NOTHING
        //         // rationale: void data will cause a crash in trying to write the local Viking; void data will be filled by synchronizeContract()
        //         // rationale 2: doing the contract-level synchronization here may be considered "messy"
        //         // TODO
        //         // if (!vikingData.appearance.isZero()) {
        //         //     EthHelper.LOGGER.info(`EthHelper [synchronizeDatabase] creating local Viking with ID ${i}`);
        //         //     await EthHelper.generateViking(i, vikingData);
        //         // }
        //         // else {
        //         //     EthHelper.LOGGER.error(`EthHelper [synchronizeDatabase] skipping Viking with ID ${i}; data is void`);
        //         // }
        //     }
        // }
    }

    /**
     * Synchronize the local Viking image output directory with the local Viking database
     *
     * Handles data loss/failed image generations for local Vikings. Executed in recovery stage after database synchronization so as to avoid the need
     *   to be retrieving data from the Contract, optimizing out a bunch of RPC calls
     *
     * @param localVikingCount the number of generated Vikings in the Contract's set
     */
    private static async synchronizeImages(localVikingCount: number): Promise<void> {
        // eslint-disable-next-line
        // const imageNumbers = fs.readdirSync(ImageHelper.VIKING_OUT).map((f) => parseInt(/_([0-9]+)/.exec(f)?.[1] ?? '', 10)).filter((n) => !isNaN(n));

        // for (let i = 0; i < localVikingCount; i++) {
        //     if (!imageNumbers.includes(i)) {
        //         EthHelper.LOGGER.info(`EthHelper [synchronizeImages]: generating Viking Image for ID ${i}`);

        //         const vikingData = await vikingService.findOne({ number: i });

        //         if (vikingData) {
        //             // await ImageHelper.generateVikingImage(VikingSpecificationHelper.buildVikingSpecification(i, vikingData));
        //         }
        //         else {
        //             EthHelper.LOGGER.error(`EthHelper [synchronizeImages] skipping Viking Image for ID ${i}; data is void`);
        //         }
        //     }
        // }
    }

    /**
     * Synchronize the Contract's generated Viking set with the Contract's minted NFT set by triggering generateViking() calls for all Viking IDs
     *   which are missing data in the Vikings map
     *
     * Can occur if VikingReady events are missed or if generateViking calls fail somehow
     *
     * Also synchronizes the local database once the routine is complete if we're not in listening mode so as to ensure data integrity with only a
     *   single execution
     *
     * @param totalSupply the number of minted NFT's on the Contract
     * @param vikingCount number of generated vikings in the Contract's set
     */
    private static async synchronizeContract(totalSupply: number, vikingCount: number): Promise<void> {
        // let count = vikingCount;

        // for (let i = 0; i < totalSupply; i++) {
        //     EthHelper.LOGGER.info(`EthHelper [synchronizeContract] checking Viking with ID ${i}...`);

        //     const data = await EthHelper.CONTRACT.functions.vikings(i);
        //     // TODO
        //     count++;
        //     // if (data.appearance.isZero()) {
        //     //     EthHelper.LOGGER.info(`EthHelper [synchronizeContract] Viking with ID ${i} void; sending generateViking() call request`);

        //     //     await EthHelper.CONTRACT.functions.generateViking(i, { gasPrice: 1000000000 }).then(
        //     //         () => {
        //     //             count++;
        //     //         },
        //     //         (err) => {
        //     //             EthHelper.LOGGER.error(`EthHelper [synchronizeContract]: error during generateViking() call request for ID ${i}:`, err);
        //     //         }
        //     //     );
        //     // }
        // }

        // // if we did fill any void data, and if we're NOT listening, force-sync the database
        // // if we are listening, the generateViking() calls will naturally sync the database by way of the usual event-handling procedure
        // if (count > vikingCount && !EthHelper.LISTEN) {
        //     await EthHelper.synchronizeDatabase(count);
        // }
    }

    /**
     * Synchronize the local Viking representations' names with their Contract counterparts
     *
     * Universally handles missed NameChange error cases in a dumb and non-RPC-optimal way, due to difficulties in detecting out-of-sync names
     *   and inherent unreliability of any approach that could be taken to do so
     *
     * Activated with a separate environment variable to the other recovery routines so as not to overload the RPC with tonnes of potentially-wasted
     *   calls, allowing us to specifically run this scenario by choice
     *
     * @param vikingCount the number of generated vikings in the Contract's set
     */
    private static async synchronizeNames(vikingCount: number): Promise<void> {
        for (let i = 0; i < vikingCount; i++) {
            EthHelper.LOGGER.info(`EthHelper [synchronizeNames] synchronizing name for Viking with ID ${i}...`);

            const { name } = await EthHelper.CONTRACT.functions.vikings(i);

            await vikingService.updateOne({ number: i }, { name });
        }
    }

    /**
     * Generate a single Viking (image + database) with a given numerical ID based on some given Viking Contract Data
     *
     * @param vikingId the Token ID of the Viking to generate
     * @param stats the VikingStats of the Viking to generate
     * @param components the VikingComponents of the Viking to generate
     * @param conditions the VikingConditions of the Viking to generate
     */
    // eslint-disable-next-line
    private static async generateVikingFromContract(vikingId: number, stats: VikingStats, components: VikingComponents, conditions: VikingConditions): Promise<void> {
        EthHelper.LOGGER.info(`EthHelper [generateViking]: generating Viking with ID ${vikingId}`);

        // derive the intermediate VikingSpecification structure for handing off to both the Viking and Image Helpers
        const vikingSpecification = VikingSpecificationHelper.buildSpecificationFromContract(vikingId, stats, components, conditions);

        // run generations in parallel
        await Promise.all([
            ImageHelper.generateVikingImage(vikingSpecification),
            VikingHelper.storeViking(vikingSpecification)
        ]);

        EthHelper.LOGGER.info(`EthHelper [generateViking]: generated Viking with ID ${vikingId}`);
    }

    /**
     * VikingReady Contract Event handler - add the received Token ID to the GENERATE_VIKING_CALL_QUEUE to queue up the generation of the
     *   associated VikingStats on the Contract
     *
     * @param vikingId the Token ID of the Viking to request a generation for, emitted with the VikingReady event
     */
    private static onVikingReady(vikingId: BigNumber): void {
        EthHelper.LOGGER.info(`EthHelper [VikingReady]: queueing generateViking call request for Viking ID ${vikingId.toNumber()}`);

        EthHelper.GENERATE_VIKING_CALL_QUEUE.push(vikingId);
    }

    /**
     * VikingGenerated Contract Event handler - add the received Token ID to the RESOLVE_VIKING_CALL_QUEUE to queue up the resolution of the
     *   associated VikingComponents/VikingConditions on the Contract
     *
     * @param vikingId the Token ID of the Viking to request resolution for, emitted with the VikingGenerated event
     */
    private static onVikingGenerated(vikingId: BigNumber): void {
        EthHelper.LOGGER.info(`EthHelper [VikingGenerated] queueing resolveViking call request for Viking ID ${vikingId.toNumber()}`);

        EthHelper.RESOLVE_VIKING_CALL_QUEUE.push(vikingId);
    }

    /**
     * VikingResolved Contract Event handler - receive the name, VikingComponents and VikingConditions and create a local representation + image for
     *   the Viking
     *
     * Queues up a completeViking call once done for front end feedback
     *
     * @param vikingId the Token ID of the resolved Viking, emitted with the VikingResolved event
     * @param stats the VikingStats as generated by the Contract, emitted with the VikingResolved event
     * @param components the VikingComponents as resolved by the Contract, emitted with the VikingResolved event
     * @param conditions the VikingConditions as resolved by the Contract, emitted with the VikingResolved event
     */
    // eslint-disable-next-line
    private static onVikingResolved(vikingId: BigNumber, stats: VikingStats, components: VikingComponents, conditions: VikingConditions): void {
        const number = vikingId.toNumber();

        EthHelper.LOGGER.info(`EthHelper [VikingResolved] creating local representation for Viking ID ${number}`);

        EthHelper.generateVikingFromContract(number, stats, components, conditions).then(
            () => {
                EthHelper.LOGGER.info(`EthHelper [VikingResolved]: queueing completeViking call request for Viking ID: ${number}`);

                EthHelper.COMPLETE_VIKING_CALL_QUEUE.push(vikingId);
            },
            (err) => {
                EthHelper.LOGGER.error('EthHelper [VikingResolved]: error during viking generation:', err);
            }
        );

        // queue up a completeViking call request
        EthHelper.COMPLETE_VIKING_CALL_QUEUE.push(vikingId);
    }

    /**
     * NameChange Contract Event handler - update a local Viking representation's name with the received new name
     *
     * @param vikingId the NFT/Viking Number of the Viking to update, emitted with the NameChange event
     * @param name the new name for the Viking, representative of the new Contract-data name, emitted with the NameChange event
     */
    private static onNameChange(vikingId: BigNumber, name: string): void {
        const number = vikingId.toNumber();

        EthHelper.LOGGER.info(`EthHelper [NameChange]: NameChange - ID ${number} - name ${name}`);

        // catch errors but do not throw them so as to allow the API to continue running
        vikingService.updateOne({ number }, { name }).catch((err) => {
            EthHelper.LOGGER.error('EthHelper [NameChange]: Error during Viking name update:', err);
        });
    }
}
