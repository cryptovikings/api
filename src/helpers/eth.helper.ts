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
import { forever } from 'async';

/**
 * Internal-use interface for the object storing local + remote viking/nft counts
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
     * Whether or not to recover from API/Contract synchronization issues
     */
    private static readonly RECOVER = process.env.ETH_RECOVER === 'true' ?? false;

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
        NameChange: EthHelper.onNameChange
    };

    /**
     * // TODO in-memory event queue - do we maybe want a database queue instead?
     */
    private static EVENT_QUEUE: Array<any> = [];

    /**
     * Initialize by registering all event listeners if required and synchronizing local data with Contract data if necessary
     */
    public static async initialize(): Promise<void> {
        // handle event listeners
        if (EthHelper.LISTEN) {
            EthHelper.registerListeners();
            EthHelper.startEventQueue();
        }
        else {
            console.warn('EthHelper: Contract Event Listeners disabled');
        }

        // handle recovery scenarios
        // recovery scenarios are checked and executed in a specific order so as to avoid the need to run EthHelper.counts() more than once,
        //   optimising for reduced RPC load and overall API boot speed
        if (EthHelper.RECOVER) {
            console.log('EthHelper: checking for recovery scenarios...');

            // retrieve the local and remote viking + nft counts
            const counts = await EthHelper.counts();
            console.log('EthHelper: local Viking count:', counts.local);
            console.log('EthHelper: remote NFT count:', counts.remoteNFTs);
            console.log('EthHelper: remote Viking count:', counts.remoteVikings);

            // if the database is out of sync with the remote generated Viking count, we need to create database entries for all missing Vikings
            // this may occur if the API missed a VikingGenerated event and therefore failed to receive the Contract Data + generate a local Viking
            if (EthHelper.databaseOutOfSync(counts)) {
                console.warn('EthHelper: Database out of sync!');

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

            // if the image directory is out of sync with the remote generated Viking count, we need to create images for missed Vikings
            // this may occur if we migrate to a new filesystem, or if images have been deleted
            // do this SECOND, since the check counts the files in the VIKING_OUT directory - if the above scenario triggered, images for those
            //   missing generations will now exist, but we may still have unrelated missing images!
            if (EthHelper.imagesOutOfSync(counts)) {
                console.warn('EthHelper: Images out of sync!');

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

            // if the Contract is out of sync with itself (generated viking count lower than minted NFT count), we need to trigger generateViking()
            //   calls for those Vikings which have been missed
            // this may occur if the API missed a VikingReady event and therefore failed to trigger a subsequent generateViking() call
            // do this LAST, as this triggers an asynchronous call => event process which we don't want to cross-polinate with synchronous DB/Image
            //   recoveries
            if (EthHelper.contractOutOfSync(counts)) {
                console.warn('EthHelper: Contract ouf of sync!');

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
            console.warn('EthHelper: not in recovery mode');
        }
    }

    /**
     * // TODO
     */
    private static startEventQueue(): void {
        forever(
            (next) => {
                if (EthHelper.EVENT_QUEUE.length) {
                    const vikingId = EthHelper.EVENT_QUEUE.shift() as number;

                    EthHelper.CONTRACT.functions.generateViking(vikingId, { gasPrice: 1000000000 }).then(
                        () => {
                            console.log(`EthHelper: sent generateViking() call request for Viking ID ${vikingId}`);

                            next();
                        },
                        (err) => {
                            console.error(`EthHelper: error sending generateViking() call request for Viking ID ${vikingId}:`, err);

                            // TODO do we actually want to stop execution?
                            next(err);
                        }
                    );
                }
                else {
                    next();
                }
            },
            (err) => {
                console.error('Event Queue stopped:', err);
            }
        );
    }

    /**
     * Retrieve the number of locally-stored Vikings as well as the Contract's NFT count (totalSupply()) and (generated) Viking Count
     *
     * Used to detect recovery scenarios on API initialization
     *
     * @returns the local and remote counts
     */
    private static async counts(): Promise<Counts> {
        return {
            local: await vikingService.count({}),
            remoteNFTs: (await EthHelper.CONTRACT.functions.totalSupply())[0]?.toNumber(),
            remoteVikings: (await EthHelper.CONTRACT.functions.vikingCount())[0]?.toNumber()
        };
    }

    /**
     * Nominal check for whether or not the local Viking database is out of sync with the remote's generated Viking set
     *
     * Uses the remote generated viking count, not the NFT count, as we can only generate Vikings based on Contract-stored Viking data
     *
     * @param counts the local + remote viking/nft counts
     *
     * @returns whether or not the database is out of sync
     */
    private static databaseOutOfSync(counts: Counts): boolean {
        return counts.local !== counts.remoteVikings;
    }

    /**
     * Nominal check for whether or not the viking image output directory is out of sync with the remote's generated Viking set
     *
     * Uses the remote generated viking count, not the NFT count, as can only generate images based on Contract-stored Viking data
     *
     * Counts the images *at the time of method call* so as to not regenerate images for Vikings populated by the databaseOutOfSync() recovery routine
     *
     * @param counts the local + remote viking/nft counts
     *
     * @returns whether or not the image output directory is out of sync
     */
    private static imagesOutOfSync(counts: Counts): boolean {
        // sub 1 from viking image file count due to presence of viking_unknown.png
        return (fs.readdirSync(ImageHelper.VIKING_OUT).length - 1) < counts.remoteVikings;
    }

    /**
     * Nominal check for whether or not the Contract's generated Viking set is out of sync with the Contract's minted NFT set
     *
     * @param counts the local + remote viking/nft counts
     *
     * @returns whether or not the Contract generaed data is out of sync with the minted NFT set
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
        console.log(`EthHelper: listening for Contract Events with Polling Interval [${EthHelper.LISTENER_POLLING_INTERVAL}] on [${process.env.ETH_PROVIDER_URL!}]`);

        // register all listeners
        for (const [event, listener] of Object.entries(EthHelper.EVENT_MAP)) {
            console.log(`EthHelper: registering listener for event [${event}]`);

            EthHelper.CONTRACT.on(event, listener);
        }
    }

    /**
     * Synchronize the local Viking database with the Contract's generated Viking set
     *
     * Fills gaps in the database by working on the knowledge that Viking IDs are sequential on the Contract side, generating any Viking with an ID
     *   in the range (0 => vikingCount) which does not have a document in the database with that ID
     *
     * @param vikingCount the number of generated Vikings in the Contract's set
     */
    private static async synchronizeVikings(vikingCount: number): Promise<void> {
        const localNumbers = (await vikingService.findMany({}, ['number'])).docs.map((v) => v.number);

        for (let i = 0; i < vikingCount; i++) {
            if (!localNumbers.includes(i)) {
                // retrieve the Viking's data from the Contract
                const vikingData = await EthHelper.CONTRACT.functions.vikings(i);

                // generate the Viking
                await EthHelper.generateViking(i, vikingData);
            }
        }
    }

    /**
     * Synchronize the local Viking image output directory with the Contract's generated Viking set
     *
     * Fills gaps in the image output directory by working on the knowledge that Viking IDs are sequential on the Contract side, generating an image
     *   for any Viking with an ID in the range (0 => vikingCount) which is not reflected in the output directory
     *
     * // TODO needs cleanup
     *
     * @param vikingCount the number of generated Vikings in the Contract's set
     */
    private static async synchronizeImages(vikingCount: number): Promise<void> {
        const imageFiles = fs.readdirSync(ImageHelper.VIKING_OUT);

        // extract just the numbers from the image filenames, representative of the Viking IDs
        const imageNumbers = imageFiles.filter((f) => !f.includes('unknown')).map((f) => parseInt(/_([0-9]+)/.exec(f)![1], 10));

        for (let i = 0; i < vikingCount; i++) {
            if (!imageNumbers.includes(i)) {
                console.log(`EthHelper: generating Viking Image for ID ${i}`);

                // build a VikingSpecification for the Viking's data as retrieved from the Contract
                const vikingSpecification = VikingSpecificationHelper.buildVikingSpecification(i, await EthHelper.CONTRACT.functions.vikings(i));

                // generate the image
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

    /**
     * Synchronize the Contract's generated Viking set with the Contract's minted NFT set by triggering generateViking() calls for all Viking IDs in
     *   the range (vikingCount => nftCount), producing stored Viking data for all missed VikingGenerated events
     *
     * Just sends the call request, relying on the API's VikingGenerated event listener to pick up the remote emission so as to inline-synchronize
     *   the Viking database + image output directory as an intrinsic aspect of the procedure
     *
     * // TODO needs cleanup
     *
     * @param nftCount the number of minted NFT's on the Contract
     * @param the number of generated vikings in the Contract's set
     */
    private static async synchronizeContract(nftCount: number, vikingCount: number): Promise<void> {
        for (let i = vikingCount; i < nftCount; i++) {
            console.log(`EthHelper: sending generateViking() call request for Viking ID ${i}`);

            await EthHelper.CONTRACT.functions.generateViking(i);

            console.log(`EthHelper: sent generateViking() call request for Viking ID ${i}`);
        }
    }

    /**
     * Generate a single Viking (image + database) with a given numerical ID based on some given Viking Contract Data
     *
     * @param vikingId the NFT/Viking Number of the Viking to generate
     * @param vikingData the Contract Data representing the Viking
     */
    private static async generateViking(vikingId: number, vikingData: VikingContractModel): Promise<void> {
        console.log(`EthHelper: generating Viking with ID ${vikingId}`);

        // derive the intermediate VikingSpecification structure for handing off to both the Viking and Image Helpers
        const vikingSpecification = VikingSpecificationHelper.buildVikingSpecification(vikingId, vikingData);

        // run generations in parallel
        await Promise.all([
            ImageHelper.generateImage(vikingSpecification).catch((err) => {
                console.error('EthHelper: error during image generation');
                // error will be a GraphicsMagick error - wrap it into an APIError
                throw ErrorHelper.createError(
                    HttpErrorCode.INTERNAL_SERVER_ERROR,
                    `Failed to generate image for Viking with ID ${vikingId} : ${JSON.stringify(err)}`
                );
            }),
            VikingHelper.createViking(vikingSpecification).catch((err) => {
                console.error('EthHelper: error during viking generation');
                // error will already be an APIError
                throw err;
            })
        ]);

        console.log(`EthHelper: generated Viking with ID ${vikingId}`);
    }

    /**
     * VikingReady Contract Event handler - kick off a `generateViking()` transaction to generate the data for the received NFT/Viking Number
     *
     * @param vikingId the NFT/Viking Number of the Viking to request a generation for, emitted with the VikingReady event
     */
    private static onVikingReady(vikingId: BigNumber): void {
        console.log(`EthHelper: VikingReady - Viking ID: ${vikingId.toString()}`);

        // EthHelper.WALLET.sendTransaction()

        EthHelper.EVENT_QUEUE.push(vikingId);

        // EthHelper.CONTRACT.functions.generateViking(vikingId, { gasPrice: 1000000000 }).then(
        //     () => {
        //         console.log(`EthHelper: sent generateViking() call request for Viking ID ${vikingId.toString()}`);
        //     },
        //     (err) => {
        //         console.error(`EthHelper: error sending generateViking() call request for Viking ID ${vikingId.toString()}:`, err);
        //     }
        // );
    }

    /**
     * VikingGenerated Contract Event handler - generate a local Viking representation based on the received Viking Contract Data
     *
     * @param vikingId the NFT/Viking Number of the Viking to generate, emitted with the VikingGenerated event
     * @param vikingData the Viking's Contract-generated data, emitted with the VikingGenerated event
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
     * NameChange Contract Event handler - update a local Viking representation's name with the received new name
     *
     * @param name the new name for the Viking, representative of the new Contract-data name, emitted with the NameChange event
     * @param vikingId the NFT/Viking Number of the Viking to update, emitted with the NameChange event
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
