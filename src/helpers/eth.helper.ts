import fs from 'fs';
import { BigNumber, Contract, providers, Wallet } from 'ethers';

import nornirABI from '../nornir.abi.json';
import { VikingContractModel } from '../models/viking/vikingContract.model';
import { vikingService } from '../services/viking.service';
import { VikingSpecificationHelper } from './vikingSpecification.helper';
import { VikingHelper } from './viking.helper';
import { ImageHelper } from './image.helper';
import { ErrorHelper } from './error.helper';
import { HttpErrorCode } from '../enums/httpErrorCode.enum';

/**
 * // TODO
 */
interface Counts {
    local: number;
    remoteNFTs: number;
    remoteVikings: number;
}

/**
 * EthHelper, encapsulating all Ethereum-related functionality, including Contract instantiation and interaction, Contract data synchronization,
 *   recovery, and Contract Event Listeners
 *
 * // TODO recovery: local names out of sync?
 *
 * // TODO Nonce Conflicts are encountered due to race conditions on many simultaneous mint events - we probably need an Event Queue
 * //   alternative thoughts: we could just handle Nonce manually, since we know the Wallet which will initiate transactions?
 *
 * // TODO Promise handling throughout this class could probably do with tidying up/localising. Esp., error handling within Viking + Image Helpers??
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
    private static readonly WALLET = new Wallet(process.env.ETH_WALLET_SECRET!, EthHelper.PROVIDER);

    /**
     * Contract instance; a NornirContract for type safety
     */
    private static readonly CONTRACT: NornirContract = new Contract(EthHelper.CONTRACT_ADDRESS, nornirABI, EthHelper.WALLET) as NornirContract;

    /**
     * Whether or not to run Contract event listeners
     */
    private static readonly LISTEN = process.env.ETH_EVENT_LISTENERS === 'true' ?? false;

    /**
     * Whether or not to recover from API/Contract synchronization issues
     */
    private static readonly RECOVER = process.env.ETH_RECOVER === 'true' ?? false;

    /**
     * Polling Interval for Contract event listeners
     */
    private static readonly LISTENER_POLLING_INTERVAL = parseInt(process.env.ETH_PROVIDER_POLLING_INTERVAL!, 10);

    /**
     * Map of event name => event listener
     */
    private static readonly EVENT_MAP = {
        VikingReady: EthHelper.onVikingReady,
        VikingGenerated: EthHelper.onVikingGenerated,
        NameChange: EthHelper.onNameChange
    };

    /**
     * Initialize by registering all event listeners if required and synchronizing local data with Contract data if necessary
     */
    public static async initialize(): Promise<void> {
        // handle event listeners
        if (EthHelper.LISTEN) {
            EthHelper.registerListeners();
        }
        else {
            console.log('EthHelper: Contract Event Listeners disabled');
        }

        if (EthHelper.RECOVER) {
            console.log('EthHelper: checking for recovery scenarios...');

            // recovery types:
            //   API has missed some `VikingGenerated` events / DB is somehow out of sync - detect by local db count being lower than remote count
            //   API is missing some images (but db is in sync) - detect by image count being lower than local db count
            //   Contract has missed some `GenerateViking` calls - detect by... // TODO
            //      - could happen if the API missed a `VikingReady` event or otherwise failed to trigger `GenerateViking`

            const counts = await EthHelper.counts();

            console.log('EthHelper: local Viking count:', counts.local);
            console.log('EthHelper: remote NFT count:', counts.remoteNFTs);
            console.log('EthHelper: remote Viking count:', counts.remoteVikings);

            if (EthHelper.databaseOutOfSync(counts)) {
                console.log('EthHelper: Database out of sync!');

                // TODO vikings or NFTs?
                await EthHelper.synchronizeVikings(counts.remoteVikings).then(
                    () => {
                        console.log('EthHelper: Viking Database synchronized');
                    },
                    (err) => {
                        console.error('EthHelper: error during Viking Database synchronization');
                        throw err;
                    }
                )
            }
            else {
                console.log('EthHelper: database is in sync');
            }

            if (EthHelper.imagesOutOfSync(counts)) {
                console.log('EthHelper: Images out of sync!');

                // TODO vikings or NFTs?
                await EthHelper.synchronizeImages(counts.remoteVikings).then(
                    () => {
                        console.log('EthHelper: Viking Images synchronized');
                    },
                    (err) => {
                        console.error('EthHelper: error during Viking Image synchronization');
                        throw err;
                    }
                );
            }
            else {
                console.log('EthHelper: images are in sync');
            }

            // TODO do this last, important! - document why
            if (EthHelper.contractOutOfSync(counts)) {
                console.log('EthHelper: Contract ouf of sync!');

                await EthHelper.synchronizeContract(counts.remoteNFTs, counts.remoteVikings).then(
                    () => {
                        console.log('EthHelper: Viking Contract synchronized');
                    },
                    (err) => {
                        console.error('EthHelper: error during Viking Contract synchronization');
                        throw err;
                    }
                );
            }
            else {
                console.log('EthHelper: Contract is in sync');
            }
        }
        else {
            console.log('EthHelper: not in recovery mode');
        }
    }

    /**
     * Generate a single Viking (image + database) with a given numerical ID based on some given Viking Contract Data
     *
     * @param id the number of the Viking to generate
     * @param vikingData the Contract Data representing the Viking
     */
    public static async generateViking(id: number, vikingData: VikingContractModel): Promise<void> {
        console.log(`EthHelper: generating Viking with ID ${id}`);

        // derive the intermediate VikingSpecification structure for handing off to both the Viking and Image Helpers
        const vikingSpecification = VikingSpecificationHelper.buildVikingSpecification(id, vikingData);

        // run generations in parallel
        await Promise.all([
            ImageHelper.generateImage(vikingSpecification).catch((err) => {
                console.error('EthHelper: error during image generation');
                // error will be a GraphicsMagick error - wrap it into an APIError
                throw ErrorHelper.createError(
                    HttpErrorCode.INTERNAL_SERVER_ERROR,
                    `Failed to generate image for Viking with ID ${id} : ${JSON.stringify(err)}`
                );
            }),
            VikingHelper.createViking(vikingSpecification).catch((err) => {
                console.error('EthHelper: error during viking generation');
                // error will already be an APIError
                throw err;
            })
        ]);

        console.log(`EthHelper: generated Viking with ID ${id}`);
    }

    /**
     * // TODO
     *
     * @param counts
     * @returns
     */
    private static databaseOutOfSync(counts: Counts): boolean {
        // TODO vikings or NFTs?

        return counts.local !== counts.remoteVikings;
    }

    /**
     * // TODO
     *
     * @param counts
     * @returns
     */
    private static imagesOutOfSync(counts: Counts): boolean {
        // TODO vikings or NFTs?

        // sub 1 from viking image file count due to presence of viking_unknown.png
        return (fs.readdirSync(ImageHelper.VIKING_OUT).length - 1) < counts.remoteVikings;
    }

    /**
     * // TODO
     *
     * @param counts
     * @returns
     */
    private static contractOutOfSync(counts: Counts): boolean {
        return counts.remoteNFTs !== counts.remoteVikings;
    }

    /**
     * Configure the Provider's polling interval and then register all event listeners upon the Contract
     */
    private static registerListeners(): void {
        EthHelper.PROVIDER.pollingInterval = EthHelper.LISTENER_POLLING_INTERVAL;

        // eslint-disable-next-line
        console.log(`EthHelper: listening for Contract Events with Polling Interval [${EthHelper.LISTENER_POLLING_INTERVAL}] on ${process.env.ETH_PROVIDER_URL!}`);

        // register all listeners
        for (const [event, listener] of Object.entries(EthHelper.EVENT_MAP)) {
            console.log(`EthHelper: registering listener for event [${event}]`);

            EthHelper.CONTRACT.on(event, listener);
        }
    }

    /**
     * Retrieve the number of locally-stored Vikings as well as the Contract's `totalSupply`
     *
     * Useful for detecting the necessity of synchronization on API init
     *
     * @returns the local and remote Viking counts
     */
    private static async counts(): Promise<Counts> {
        return {
            local: await vikingService.count({}),
            remoteNFTs: (await EthHelper.CONTRACT.functions.totalSupply())[0]?.toNumber(),
            remoteVikings: (await EthHelper.CONTRACT.functions.vikingCount())[0]?.toNumber()
        };
    }

    /**
     * Synchronize the API with the Contract in the event that the local Viking count is lower than the Contract's `totalSupply()`
     *
     * Capable of "filling gaps" in our database - working on the knowledge that Viking Numbers are sequential on the Contract side, only generates
     *   Vikings which do not have an associated data structure in the database
     *
     * @param remoteCount the Contract's `totalSupply`
     */
    private static async synchronizeVikings(remoteCount: number): Promise<void> {
        // get a list of all database-stored Viking Numbers
        const numbers = (await vikingService.findMany({}, ['number'])).docs.map((v) => v.number);

        for (let i = 0; i < remoteCount; i++) {
            // if this number does not exist in the database, then the Viking is missing locally
            if (!numbers.includes(i)) {
                // retrieve the Viking's data from the Contract
                const vikingData = await EthHelper.CONTRACT.functions.vikings(i);

                // generate the Viking
                await EthHelper.generateViking(i, vikingData);
            }
        }
    }

    private static async synchronizeImages(remoteCount: number): Promise<void> {
        // eslint-disable-next-line
        const imageNumbers = fs.readdirSync(ImageHelper.VIKING_OUT).filter((f) => !f.includes('unknown')).map((f) => parseInt(/_([0-9]+)/.exec(f)![1], 10));

        for (let i = 0; i < remoteCount; i++) {
            if (!imageNumbers.includes(i)) {
                console.log(`EthHelper: generating Viking Image for ID ${i}`);

                const vikingSpecification = VikingSpecificationHelper.buildVikingSpecification(i, await EthHelper.CONTRACT.functions.vikings(i));

                await ImageHelper.generateImage(vikingSpecification).catch((err) => {
                    console.error('EthHelper: error during image generation');
                    // error will be a GraphicsMagick error - wrap it into an APIError
                    throw ErrorHelper.createError(
                        HttpErrorCode.INTERNAL_SERVER_ERROR,
                        `Failed to generate image for Viking with ID ${i} : ${JSON.stringify(err)}`
                    );
                });
            }
        }
    }

    private static async synchronizeContract(nftCount: number, vikingCount: number): Promise<void> {
        for (let i = vikingCount; i < nftCount; i++) {
            console.log(`EthHelper: sending generateViking() call request for Viking ID ${i}`);

            await EthHelper.CONTRACT.functions.generateViking(i);

            console.log(`EthHelper: sent generateViking() call request for Viking ID ${i}`);
        }
    }

    /**
     * VikingReady Contract Event handler - kick off a `generateViking()` transaction with the received requestId
     *
     * @param requestId the requestId emitted with the VikingReady event
     */
    private static onVikingReady(vikingId: BigNumber): void {
        console.log(`EthHelper: VikingReady - Viking ID: ${vikingId.toString()}`);

        EthHelper.CONTRACT.functions.generateViking(vikingId, { gasPrice: 1000000000 }).then(
            () => {
                console.log(`EthHelper: sent generateViking() call request for Viking ID ${vikingId.toString()}`);
            },
            (err) => {
                console.error(`EthHelper: error sending generateViking() call request for Viking ID ${vikingId.toString()}:`, err);
            }
        );
    }

    /**
     * VikingGenerated Contract Event handler - generate a local Viking representation based on the Viking Contract Data
     *
     * @param id the Viking's number emitted with the VikingGenerated event
     * @param vikingData the Viking's Contract-generated data emitted with the VikingGenerated event
     */
    private static onVikingGenerated(vikingId: BigNumber, vikingData: VikingContractModel): void {
        const number = vikingId.toNumber();

        console.log(`EthHelper: VikingGenerated - ID: ${number}`);

        EthHelper.generateViking(number, vikingData).then(
            () => {
                console.log(`EthHelper: Viking with ID ${number} generated`);
            },
            (err) => {
                console.error('EthHelper: Error during Viking generation:', err);
            }
        );
    }

    /**
     * // TODO
     *
     * @param name
     * @param vikingId
     */
    private static onNameChange(name: string, vikingId: BigNumber): void {
        const number = vikingId.toNumber();

        console.log(`EthHelper: NameChange - ID ${number}`);

        VikingHelper.updateVikingName(number, name).then(
            () => {
                console.log(`EthHelper: Viking with ID ${number} updated with name ${name}`);
            },
            (err) => {
                console.error('EthHelper: Error during Viking name update:', err);
            }
        );
    }
}
