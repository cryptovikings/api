import { BigNumber, Contract, providers, Wallet } from 'ethers';
import { ImageHelper } from '../helpers/image.helper';
import { VikingHelper } from '../helpers/viking.helper';
import { ActualVikingContractData } from '../models/vikingContractData.model';
import { vikingService } from '../services/viking.service';

import abi from './abi.json';

/**
 * Class encapsulating all Ethereum-related functionality, including Contract instantiation and interaction, as well as Contract Event Listeners
 */
export class EthInterface {

    /**
     * Contract Address, copied over from the environment
     */
    private static readonly CONTRACT_ADDRESS = process.env.ETH_CONTRACT_ADDRESS!;

    /**
     * Eth Provider
     */
    private static readonly PROVIDER = new providers.JsonRpcProvider(process.env.ETH_PROVIDER_URL);

    /**
     * Wallet which will be used as the transaction signer
     */
    private static readonly WALLET = new Wallet(process.env.ETH_WALLET_SECRET!, EthInterface.PROVIDER);

    /**
     * Contract instantiation; a NornirContract for type safety
     */
    private static readonly CONTRACT: NornirContract = new Contract(EthInterface.CONTRACT_ADDRESS, abi, EthInterface.WALLET) as NornirContract;

    /**
     * Whether or not to run Contract event listeners
     */
    private static LISTEN = process.env.ETH_EVENT_LISTENERS === 'true' ?? false;

    /**
     * Polling Interval for Contract event listeners
     */
    private static LISTENER_POLLING_INTERVAL = parseInt(process.env.ETH_PROVIDER_POLLING_INTERVAL!, 10);

    /**
     * Expandable map of event name => event listener
     */
    private static readonly EVENT_MAP = {
        VikingReady: EthInterface.onVikingReady,
        VikingGenerated: EthInterface.onVikingGenerated
    };

    /**
     * Initialize all Event Handlers
     */
    public static async initialize(): Promise<void> {
        if (EthInterface.LISTEN) {
            EthInterface.registerListeners();
        }
        else {
            console.log('EthInterface: Contract Event Listeners disabled');
        }

        await EthInterface.counts().then(
            async (counts) => {
                console.log('EthInterface: Local Viking count:', counts.local);
                console.log('EthInterface: Remote Viking count:', counts.remote);

                if (counts.local !== counts.remote) {
                    await EthInterface.catchUp(counts.local, counts.remote).then(
                        () => {
                            console.log('EthInterface: Local Vikings synchronized');
                        },
                        (err) => {
                            console.error('EthInterface: error during catchup');
                            throw err;
                        }
                    )
                }
                else {
                    console.log('EthInterface: No catchup necessary');
                }
            },
            (err) => {
                console.error('EthInterface: Error during status check');
                throw err;
            }
        );
    }

    private static async counts(): Promise<{ local: number, remote: number }> {
        return {
            local: await vikingService.count(),
            remote: (await EthInterface.CONTRACT.functions.totalSupply())[0]?.toNumber()
        };
    }

    private static registerListeners(): void {
        // set the Provider's PollingInterval
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
     * VikingReady event handler - kick off a `generateViking()` transaction with the received requestId
     *
     * @param requestId the requestId emitted with the VikingReady event
     */
    private static onVikingReady(requestId: number): void {
        console.log(`VikingReady - Request ID: ${requestId}`);

        EthInterface.CONTRACT.functions.generateViking(requestId, { gasPrice: 1000000000 }).then(
            () => {
                console.log('Sent generateViking() call request')
            },
            (err) => {
                console.error('Error occurred with sending generateViking() call request:', err);
            }
        );
    }

    /**
     * VikingGenerated event handler - generate a Viking image and resolve + store the Viking's database representation based on the received
     *   vikingData
     *
     * @param id the Viking's number emitted with the VikingGenerated event
     * @param vikingData the Viking's Contract-generated data emitted with the VikingGenerated event
     */
    private static onVikingGenerated(id: BigNumber, vikingData: ActualVikingContractData): void {
        const number = id.toNumber();

        console.log(`VikingGenerated - ID: ${number}`);

        EthInterface.generateViking(number, vikingData).then(
            () => {
                console.log(`EthInterface: Viking with ID ${number} generated`);
            },
            (err) => {
                console.error('EthInterface: Error during Viking generation:', err);
            }
        );
    }

    private static async generateViking(id: number, vikingData: ActualVikingContractData): Promise<void> {
        console.log(`Generating Viking with ID ${id}`);

        const assetSpecs = VikingHelper.resolveAssetSpecs(vikingData);

        await ImageHelper.composeImage(id, assetSpecs).then(
            async (imageUrl: string) => {
                const storage = VikingHelper.generateVikingStorage(id, imageUrl, vikingData);

                await VikingHelper.saveViking(storage);

                console.log(`EthInterface: generated Viking with ID ${id}`);
            },
            (err) => {
                console.error('EthInterface: Error during image composition:', err);
            }
        );
    }

    // TODO handle the case where a *past* Viking was deleted - this just assumed all missing Vikings are sequential
    // TODO handle the case where only images were deleted...
    private static async catchUp(start: number, end: number): Promise<void> {
        console.log(`EthInterface: catching up (generating ${end - start} Vikings)...`);

        for (let i = start; i < end; i++) {
            const vikingData = await EthInterface.CONTRACT.functions.vikings(i);

            await EthInterface.generateViking(i, vikingData);
        }
    }
}
