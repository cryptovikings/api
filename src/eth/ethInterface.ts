import { BigNumber, Contract, providers, Wallet } from 'ethers';
import { ImageHelper } from '../helpers/image.helper';
import { VikingHelper } from '../helpers/viking.helper';
import { ActualVikingContractData } from '../models/vikingContractData.model';
import { vikingService } from '../services/viking.service';

import abi from './abi.json';

/**
 * Class encapsulating all Ethereum-related functionality, including Contract instantiation and interaction, Contract data synchronization, and
 *   Contract Event Listeners
 *
 * // TODO recovery: still need to handle the use-case where just images are missing...
 */
export class EthInterface {

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
    private static readonly WALLET = new Wallet(process.env.ETH_WALLET_SECRET!, EthInterface.PROVIDER);

    /**
     * Contract instance; a NornirContract for type safety
     */
    private static readonly CONTRACT: NornirContract = new Contract(EthInterface.CONTRACT_ADDRESS, abi, EthInterface.WALLET) as NornirContract;

    /**
     * Whether or not to run Contract event listeners
     */
    private static readonly LISTEN = process.env.ETH_EVENT_LISTENERS === 'true' ?? false;

    /**
     * Polling Interval for Contract event listeners
     */
    private static readonly LISTENER_POLLING_INTERVAL = parseInt(process.env.ETH_PROVIDER_POLLING_INTERVAL!, 10);

    /**
     * Map of event name => event listener
     */
    private static readonly EVENT_MAP = {
        VikingReady: EthInterface.onVikingReady,
        VikingGenerated: EthInterface.onVikingGenerated
    };

    /**
     * Initialize by registering all event listeners if required and synchronizing local data with Contract data if necessary
     */
    public static async initialize(): Promise<void> {
        // handle event listeners
        if (EthInterface.LISTEN) {
            EthInterface.registerListeners();
        }
        else {
            console.log('EthInterface: Contract Event Listeners disabled');
        }

        // retrieve the number of local + remote Vikings
        const counts = await EthInterface.counts().catch(
            (err) => {
                console.error('EthInterface: error during status check');
                throw err;
            }
        );

        console.log('EthInterface: local Viking count:', counts.local);
        console.log('EthInterface: remote Viking count:', counts.remote);

        // synchronize if necessary
        if (counts.local !== counts.remote) {
            await EthInterface.synchronize(counts.remote).then(
                () => {
                    console.log('EthInterface: Local Vikings synchronized');
                },
                (err) => {
                    console.error('EthInterface: error during synchronization');
                    throw err;
                }
            );
        }
        else {
            console.log('EthInterface: no synchronization necessary');
        }
    }

    /**
     * Configure the Provider's polling interval and then register all event listeners upon the Contract
     */
    private static registerListeners(): void {
        EthInterface.PROVIDER.pollingInterval = EthInterface.LISTENER_POLLING_INTERVAL;

        // eslint-disable-next-line
        console.log(`EthInterface: listening for Contract Events with Polling Interval [${EthInterface.LISTENER_POLLING_INTERVAL}] on ${process.env.ETH_PROVIDER_URL!}`);

        // register all listeners
        for (const [event, listener] of Object.entries(EthInterface.EVENT_MAP)) {
            console.log(`EthInterface: registering listener for event [${event}]`);

            EthInterface.CONTRACT.on(event, listener);
        }
    }

    /**
     * Retrieve the number of locally-stored Vikings as well as the Contract's `totalSupply`
     *
     * @returns the local and remote Viking counts
     */
    private static async counts(): Promise<{ local: number, remote: number }> {
        return {
            local: await vikingService.count(),
            remote: (await EthInterface.CONTRACT.functions.totalSupply())[0]?.toNumber()
        };
    }

    /**
     * Generate a single Viking (image + database) with a given numerical ID based on some given Viking Contract Data
     *
     * @param id the number of the Viking to generate
     * @param vikingData the Contract Data representing the Viking
     */
    private static async generateViking(id: number, vikingData: ActualVikingContractData): Promise<void> {
        console.log(`EthInterfadce: generating Viking with ID ${id}`);

        // TODO redesign this procedure
        const assetSpecs = VikingHelper.resolveAssetSpecs(vikingData);

        const imageUrl = await ImageHelper.composeImage(id, assetSpecs).catch(
            (err) => {
                console.error('EthInterface: error during image composition');
                throw err;
            }
        );

        const storage = VikingHelper.generateVikingStorage(id, imageUrl, vikingData);

        await VikingHelper.saveViking(storage).catch(
            (err) => {
                console.error('EthInterface: error during Viking database write');
                throw err;
            }
        );

        console.log(`EthInterface: generated Viking with ID ${id}`);
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
                const vikingData = await EthInterface.CONTRACT.functions.vikings(i);

                // generate the Viking
                await EthInterface.generateViking(i, vikingData);
            }
        }
    }

    /**
     * VikingReady event handler - kick off a `generateViking()` transaction with the received requestId
     *
     * @param requestId the requestId emitted with the VikingReady event
     */
    private static onVikingReady(requestId: number): void {
        console.log(`EthInterface: VikingReady - Request ID: ${requestId}`);

        EthInterface.CONTRACT.functions.generateViking(requestId, { gasPrice: 1000000000 }).then(
            () => {
                console.log('EthInterface: sent generateViking() call request');
            },
            (err) => {
                console.error('EthInterface: error sending generateViking() call request:', err);
            }
        );
    }

    /**
     * VikingGenerated event handler - generate a local Viking representation based on the Viking Contract Data
     *
     * @param id the Viking's number emitted with the VikingGenerated event
     * @param vikingData the Viking's Contract-generated data emitted with the VikingGenerated event
     */
    private static onVikingGenerated(id: BigNumber, vikingData: ActualVikingContractData): void {
        const number = id.toNumber();

        console.log(`EthInterface: VikingGenerated - ID: ${number}`);

        EthInterface.generateViking(number, vikingData).then(
            () => {
                console.log(`EthInterface: Viking with ID ${number} generated`);
            },
            (err) => {
                console.error('EthInterface: Error during Viking generation:', err);
            }
        );
    }
}
