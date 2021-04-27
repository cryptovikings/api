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
 * EthHelper, encapsulating all Ethereum-related functionality, including Contract instantiation and interaction, Contract data synchronization, and
 *   Contract Event Listeners
 *
 * // TODO recovery: still need to handle the use-case where just images are missing...
 * // TODO recovery: potentially want to handle the scenario where somehow a Contract `generateViking()` was missed
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
     * Whether or not to catch up/synchronise with the Contract data
     */
    private static readonly CATCH_UP = process.env.CATCH_UP === 'true' ?? false;

    /**
     * Polling Interval for Contract event listeners
     */
    private static readonly LISTENER_POLLING_INTERVAL = parseInt(process.env.ETH_PROVIDER_POLLING_INTERVAL!, 10);

    /**
     * Map of event name => event listener
     */
    private static readonly EVENT_MAP = {
        VikingReady: EthHelper.onVikingReady,
        VikingGenerated: EthHelper.onVikingGenerated
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

        // retrieve the number of local + remote Vikings
        const counts = await EthHelper.counts().catch(
            (err) => {
                console.error('EthHelper: error during status check');
                throw err;
            }
        );

        console.log('EthHelper: local Viking count:', counts.local);
        console.log('EthHelper: remote Viking count:', counts.remote);

        // synchronize if necessary
        if (counts.local !== counts.remote && EthHelper.CATCH_UP) {
            await EthHelper.synchronize(counts.remote).then(
                () => {
                    console.log('EthHelper: Local Vikings synchronized');
                },
                (err) => {
                    console.error('EthHelper: error during synchronization');
                    throw err;
                }
            );
        }
        else {
            console.log('EthHelper: no synchronization necessary');
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
    private static async counts(): Promise<{ local: number, remote: number }> {
        return {
            local: await vikingService.count({}),
            remote: (await EthHelper.CONTRACT.functions.totalSupply())[0]?.toNumber()
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
    private static async synchronize(remoteCount: number): Promise<void> {
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

    /**
     * VikingReady Contract Event handler - kick off a `generateViking()` transaction with the received requestId
     *
     * @param requestId the requestId emitted with the VikingReady event
     */
    private static onVikingReady(requestId: number): void {
        console.log(`EthHelper: VikingReady - Request ID: ${requestId}`);

        EthHelper.CONTRACT.functions.generateViking(requestId, { gasPrice: 1000000000 }).then(
            () => {
                console.log('EthHelper: sent generateViking() call request');
            },
            (err) => {
                console.error('EthHelper: error sending generateViking() call request:', err);
            }
        );
    }

    /**
     * VikingGenerated Contract Event handler - generate a local Viking representation based on the Viking Contract Data
     *
     * @param id the Viking's number emitted with the VikingGenerated event
     * @param vikingData the Viking's Contract-generated data emitted with the VikingGenerated event
     */
    private static onVikingGenerated(id: BigNumber, vikingData: VikingContractModel): void {
        const number = id.toNumber();

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
}
