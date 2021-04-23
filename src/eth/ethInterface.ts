import { BigNumber, Contract, providers, Wallet } from 'ethers';
import { ImageHelper } from '../helpers/image.helper';
import { VikingHelper } from '../helpers/viking.helper';
import { ActualVikingContractData } from '../models/vikingContractData.model';

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
    private static readonly CONTRACT = new Contract(EthInterface.CONTRACT_ADDRESS, abi, EthInterface.WALLET);

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
    public static initialize(): void {
        EthInterface.PROVIDER.pollingInterval = EthInterface.LISTENER_POLLING_INTERVAL;

        if (EthInterface.LISTEN) {
            console.log(`EthInterface: Listening for Contract Events on ${process.env.ETH_PROVIDER_URL!}`);

            for (const [event, listener] of Object.entries(EthInterface.EVENT_MAP)) {
                // TODO make whether or not these are registered configurable in .env
                EthInterface.CONTRACT.on(event, listener);
            }
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
                console.log('Error occurred with sending generateViking() call request:', err);
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
        console.log('Generating Viking based on Contract Data...', vikingData);

        const assetSpecs = VikingHelper.resolveAssetSpecs(vikingData);

        ImageHelper.composeImage(number, assetSpecs).then(async (imageUrl: string) => {
            const storage = VikingHelper.generateVikingStorage(number, imageUrl, vikingData);

            await VikingHelper.saveViking(storage);
        }, (err) => {
            console.error('COMPOSE IMAGE FAILED', err);
        });
    }
}
