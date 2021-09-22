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
 * Convenience interface for packing the results of EthHelper.remoteCounts() into an object
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
     * Eth Wallet
     */
    private static readonly WALLET = process.env.ETH_WALLET ? new Wallet(process.env.ETH_WALLET!, EthHelper.PROVIDER) : undefined;

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
     * Gas price for transactions
     */
    private static readonly GAS_PRICE = parseInt(process.env.ETH_GAS_PRICE!, 10);

    /**
     * Map of event name => event listener
     */
    private static readonly EVENT_MAP = {
        VikingReady: EthHelper.onVikingReady,
        VikingGenerated: EthHelper.onVikingGenerated,
        VikingResolved: EthHelper.onVikingResolved,
        NameChange: EthHelper.onNameChange
    };

    /**
     * Array to serve as an in-memory queue for generateViking call requests, avoiding a nonce conflicts for outgoing transactions by processing all
     *   TXs one at a time
     */
    private static readonly GENERATE_VIKING_CALL_QUEUE: Array<BigNumber> = [];

    /**
     * Array to serve as an in-memory queue for resolveViking call requests, avoiding a nonce conflicts for outgoing transactions by processing all
     *   TXs one at a time
     */
    private static readonly RESOLVE_VIKING_CALL_QUEUE: Array<BigNumber> = [];

    /**
     * Array to serve as an in-memory queue for completeViking call requests, avoiding a nonce conflicts for outgoing transactions by processing all
     *   TXs one at a time
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

        // listen first to catch + queue any events produced by users or by recover()
        if (EthHelper.LISTEN) {
            EthHelper.listen();
        }
        else {
            EthHelper.LOGGER.warn('EthHelper [Initialize]: Ethereum Event Listeners disabled');
        }

        // recover second to fix holes in local or contract data
        if (EthHelper.RECOVER) {
            await EthHelper.recover();
        }
        else {
            EthHelper.LOGGER.warn('EthHelper [Initialize]: Recovery mode disabled');
        }

        // begin the event processing loop last so as not to interfere with recover() and to process all prior + future events
        if (EthHelper.LISTEN) {
            EthHelper.queue();
        }

        EthHelper.LOGGER.info('EthHelper [Initialize]: Initialization complete');
    }

    /**
     * Public reflection of generateVikingFromContract() for use by the testController
     *
     * @param vikingId the Token ID of the Viking to generate
     * @param stats the VikingStats of the Viking to generate
     * @param components the VikingComponents of the Viking to generate
     * @param conditions the VikingConditions of the Viking to generate
     */
    public static async testGenerateViking(vikingId: number, stats: VikingStats, components: VikingComponents, conditions: VikingConditions): Promise<void> {
        return EthHelper.generateVikingFromContract(vikingId, stats, components, conditions);
    }

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
     * Begin an event processing queue for handling outgoing write transactions in series, avoiding nonce conflicts in the minting procedure
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

                    EthHelper.CONTRACT.completeViking(completeId, { gasPrice: EthHelper.GAS_PRICE }).then(
                        (response) => {
                            response.wait().then(
                                () => {
                                    next();
                                },
                                (err) => {
                                    // eslint-disable-next-line
                                    EthHelper.LOGGER.error(`EthHelper [Queue]: error waiting for confirmation of completeViking for Viking ID ${completeId.toNumber()}:`, err);

                                    next();
                                }
                            );
                        },
                        (err) => {
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

                        EthHelper.CONTRACT.resolveViking(resolveId, { gasPrice: EthHelper.GAS_PRICE }).then(
                            (response) => {
                                response.wait().then(
                                    () => {
                                        next();
                                    },
                                    (err) => {
                                        // eslint-disable-next-line
                                        EthHelper.LOGGER.error(`EthHelper [Queue]: error waiting for confirmation of resolveViking for Viking ID ${resolveId.toNumber()}:`, err);

                                        next();
                                    }
                                );
                            },
                            (err) => {
                                EthHelper.LOGGER.error(`EthHelper [Queue]: error during resolveViking call request for Viking ID ${resolveId.toNumber()}:`, err);

                                // do not halt execution! It is not a critical issue if we miss a resolveViking call
                                next();
                            }
                        );
                    }
                    else {
                        // final priority: generateViking() calls
                        const generateId = EthHelper.GENERATE_VIKING_CALL_QUEUE.shift();

                        if (generateId) {
                            EthHelper.LOGGER.info(`EthHelper [Queue]: sending generateViking call request for Viking ID ${generateId.toNumber()}`);

                            EthHelper.CONTRACT.generateViking(generateId, { gasPrice: EthHelper.GAS_PRICE }).then(
                                (response) => {
                                    response.wait().then(
                                        () => {
                                            next();
                                        },
                                        (err) => {
                                            // eslint-disable-next-line
                                            EthHelper.LOGGER.error(`EthHelper [Queue]: error waiting for confirmation of generateViking for Viking ID ${generateId.toNumber()}:`, err);

                                            next();
                                        }
                                    );
                                },
                                (err) => {
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
     * Implement various initialization-time recovery scenarios, providing assurance of data integrity and synchronization between the API and the Contract
     *
     * Recovery scenarios are detected and executed in a specific order so as to optimize RPC load and API boot time
     */
    private static async recover(): Promise<void> {
        const logger = EthHelper.LOGGER;

        logger.info('EthHelper [Recover]: implementing recovery scenarios...');

        let localVikings = await vikingService.count({}).catch((err) => {
            logger.fatal('EthHelper [Recovcer]: error during local count retrieval', err);

            // throw this error since recovery cannot continue without counts
            throw err;
        });

        const { totalSupply, generatedVikingCount, resolvedVikingCount } = await EthHelper.remoteCounts().catch((err) => {
            logger.fatal('EthHelper [Recover]: error during remote count retrieval', err);

            // throw this error since recovery cannot continue without counts
            throw err;
        });

        logger.info('EthHelper [Recover]: local Viking count:', localVikings);
        logger.info('EthHelper [Recover]: remote NFT count:', totalSupply);
        logger.info('EthHelper [Recover]: remote generated viking count:', generatedVikingCount);
        logger.info('EthHelper [Recover]: remote resolved viking count:', resolvedVikingCount);

        // recovery scenario 1: local data corruption/loss (and/or missed VikingResolved events)
        if (localVikings !== resolvedVikingCount) {
            logger.warn('EthHelper [Recover]: Database entries missing');

            await EthHelper.synchronizeLocalVikings(totalSupply).catch((err) => {
                logger.error('EthHelper [synchronizeLocalVikings]: error during local viking synchronization', err);
            });

            localVikings = await vikingService.count({});
        }
        else {
            logger.info('EthHelper [Recover]: Database is in sync');
        }

        // recovery scenario 2: local image corruption/loss or half-actioned VikingResolved events
        //   handled after/despite local recovery in case images not associated with the missed VikingResolved events are somehow not present
        if (fs.readdirSync(ImageHelper.VIKING_OUT).length - ImageHelper.DEFAULT_IMAGES.length < localVikings) {
            logger.warn('EthHelper [Recover]: Images missing');

            await EthHelper.synchronizeImages(localVikings).catch((err) => {
                logger.error('EthHelper [synchronizeImages]: error during image synchronization', err);
            });
        }
        else {
            logger.info('EthHelper [Recover]: Images are in sync');
        }

        // recovery scenario 3: missed VikingGenerated events or failed resolveViking() calls
        //   handled before missed generateViking() calls since generateViking() calls will trigger the resolveViking() response
        if (resolvedVikingCount !== generatedVikingCount) {
            logger.warn('EthHelper [Recover]: resolved Vikings out of sync with generated Vikings');

            // TODO the comparison above might not be correct
            await EthHelper.synchronizeResolvedVikings(totalSupply).catch((err) => {
                logger.error('EthHelper [synchronizeResolvedVikings]: error during resolved Viking synchronization', err);
            });
        }
        else {
            logger.info('EthHelper [Recover]: resolvedVikingCount is in sync');
        }

        // recovery scenario 4: missed VikingReady events or failed generateViking() calls
        //   handled after missed resolveViking() calls as generateViking() calls will trigger the associated resolveViking() responses
        if (totalSupply !== generatedVikingCount) {
            logger.warn('EthHelper [Recover]: generated Vikings out of sync with totalSupply()');

            await EthHelper.synchronizeGeneratedVikings(totalSupply).catch((err) => {
                logger.error('EthHelper [synchronizeGeneratedVikings]: error during generated Viking synchronization', err);
            });
        }
        else {
            logger.info('EthHelper [Recover]: generatedVikingCount is in sync');
        }

        // recovery scenario 5: missed NameChange events or otherwise out-of-sync local Viking names
        // executed last and triggered separately from other recovery scenarios due to RPC load issues. NameChange misses are impractical to detect, so the routine is
        //   "dumb" in that it just retrieves *all* Names from the Contract so as to synchronize
        if (EthHelper.RECOVER_NAMES) {
            logger.warn('EthHelper [Recover]: synchronizing names...');

            await EthHelper.synchronizeNames(generatedVikingCount).catch((err) => {
                logger.error('EthHelper [synchronizeNames]: error during name synchronization', err);
            });
        }
        else {
            logger.warn('EthHelper [Recover]: name recovery disabled');
        }
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
     * Synchronize the local Viking database + image set with the Contract's resolved set
     *
     * Handles scenarios in which VikingResolved was never received for a given ID, or scenarios in which generation at the time failed
     *
     * Cycles through from 0 => totalSupply, storing Vikings with complete Contract data that're missing locally so as to handle non-contiguous integrity issues
     *
     * @param totalSupply ERC-721 totalSupply(), providing the upper bound of VikingIds which may have resolved data
     */
    private static async synchronizeLocalVikings(totalSupply: number): Promise<void> {
        const localNumbers = (await vikingService.findMany({}, ['number'])).docs.map((v) => v.number);

        for (let i = 0; i < totalSupply; i++) {
            if (!localNumbers.includes(i)) {
                const [stats, components, conditions] = await EthHelper.CONTRACT.functions.getVikingData(i);

                // if the contract data is void, DO NOTHING
                // rationale: void data will cause a crash in trying to write the local viking; will be filled + responded to by synchronize[Generated|Resolved]Vikings()
                if (!stats.appearance.isZero() && !!components.beard && !!conditions.boots) {
                    EthHelper.LOGGER.info(`EthHelper [synchronizeLocalVikings]: creating local Viking with ID ${i}`);
                    await EthHelper.generateVikingFromContract(i, stats, components, conditions);
                }
                else {
                    EthHelper.LOGGER.error(`EthHelper [synchronizeLocalVikings]: skipping Viking with ID ${i}; data is void`);
                }
            }
        }
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
        const imageNumbers = fs.readdirSync(ImageHelper.VIKING_OUT).map((f) => parseInt(/_([0-9]+)/.exec(f)?.[1] ?? '', 10)).filter((n) => !isNaN(n));

        for (let i = 0; i < localVikingCount; i++) {
            if (!imageNumbers.includes(i)) {
                EthHelper.LOGGER.info(`EthHelper [synchronizeImages]: generating Image for Viking ID ${i}`);

                const vikingData = await vikingService.findOne({ number: i });

                if (vikingData) {
                    await ImageHelper.generateVikingImage(VikingSpecificationHelper.buildSpecificationFromDatabase(vikingData));
                }
                else {
                    EthHelper.LOGGER.error(`EthHelper [synchronizeImages] skipping Viking Image for ID ${i}; data is void`);
                }
            }
        }
    }

    /**
     * Synchronize the Contract's resolved Vikings set with its own generated Vikings set
     *
     * Handles scenarios in which resolveViking() was never called for a given ID, or scenarios in which it failed
     *
     * Cycles through from 0 => totalSupply, resolving Vikings with IDs which have associated VikingStats so as to handle non-contiguous integrity issues before
     *   synchronizeGeneratedVikings() comes along to fill the bigger gaps in both
     *
     * If we're not listening, handles the subsequent local synchronization once complete which would otherwise be handled by the usual event-handling procedure
     *
     * @param totalSupply ERC-721 totalSupply(), providing the upper bound of VikingIds which should have resolved data
     */
    private static async synchronizeResolvedVikings(totalSupply: number): Promise<void> {
        let count = 0;

        for (let i = 0; i < totalSupply; i++) {
            EthHelper.LOGGER.info(`EthHelper [synchronizeResolvedVikings]: checking Viking with ID ${i}...`);

            const [stats, components] = await EthHelper.CONTRACT.functions.getVikingData(i);

            // check that a stats does exist but that a components does not
            //   this avoids assuming that generatedVikingCount and totalSupply are the same, accounting for non-contiguous misses on all events
            //   with resolved syncing before generated (and then implicitly again resolved), this "fills the gaps" on should-be-resolved Vikings without accidentally
            //     calling resolve for a Viking which does not yet have stats, and allows the generated synchronization to fix missing stats
            if (!stats.appearance.isZero() && !components.beard) {
                EthHelper.LOGGER.info(`EthHelper [synchronizeResolvedVikings]: VikingComponents for ID ${i} void; sending resolveViking() call request`);

                await EthHelper.CONTRACT.resolveViking(i, { gasPrice: EthHelper.GAS_PRICE }).then(
                    () => {
                        count++;
                    },
                    (err) => {
                        EthHelper.LOGGER.error(`EthHelper [synchronizeResolvedVikings]: error during resolveViking() call request for ID ${i}:`, err);
                    }
                );
            }
        }

        // if we did fill any void data, and if we're NOT listening, force-sync the database
        // if we are listening, the resolveViking() calls will naturally sync the database by way of the usual event-handling procedure
        if (count && !EthHelper.LISTEN) {
            EthHelper.LOGGER.info('EthHelper [synchronizeResolvedVikings]: not listening; manually synchronizing local vikings...');
            await EthHelper.synchronizeLocalVikings(totalSupply);
        }
    }

    /**
     * Synchronize the Contract's generated Vikings set with its own total NFT supply
     *
     * Handles scenarios in which generateViking() was never called for a given ID, or scenarios in which it failed
     *
     * Cycles through 0 => totalSupply, generating Vikings with IDs that do not have an associated VikingStats so as to handle non-contiguous integrity issues
     *
     * If we're not listening, handles the subsequent re-synchronization of resolvedVikings and then implicitly local Vikings which would both otherwise be handled by
     *   the usual event-handling procedure
     *
     * @param totalSupply ERC-721 totalSupply(), providing the upper bound of VikingIds which should have generated stats
     */
    private static async synchronizeGeneratedVikings(totalSupply: number): Promise<void> {
        let count = 0;

        for (let i = 0; i < totalSupply; i++) {
            EthHelper.LOGGER.info(`EthHelper [synchronizeGeneratedVikings]: checking Viking with ID ${i}...`);

            const data = await EthHelper.CONTRACT.functions.vikingStats(i);

            if (data.appearance.isZero()) {
                EthHelper.LOGGER.info(`EthHelper [synchronizeGeneratedVikings]: VikingStats for ID ${i} void; sending generateViking() call request`);

                await EthHelper.CONTRACT.generateViking(i, { gasPrice: EthHelper.GAS_PRICE }).then(
                    () => {
                        count++;
                    },
                    (err) => {
                        EthHelper.LOGGER.error(`EthHelper [synchronizeGeneratedVikings]: error during generateViking() call request for ID ${i}:`, err);
                    }
                );
            }
        }

        // if we did fill any void data, and if we're NOT listening, force-sync remote resolved Vikings (+ implicitly then the local Vikings)
        // if we are listening, the generateViking() calls will naturally sync the resolved + local vikings by way of the usual event-handling procedure
        if (count && !EthHelper.LISTEN) {
            EthHelper.LOGGER.info('EthHelper [synchronizeGeneratedVikings]: not listening; manually resolving Vikings...');
            await EthHelper.synchronizeResolvedVikings(totalSupply);
        }
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

            const { name } = await EthHelper.CONTRACT.functions.vikingStats(i);

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
