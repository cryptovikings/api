import { BigNumber, Contract, providers, Wallet } from 'ethers';
import { ImageHelper } from '../helpers/image.helper';
import { VikingHelper } from '../helpers/viking.helper';
import { ActualVikingContractData } from '../models/vikingContractData.model';
import abi from './abi.json';

// TODO make this a helper??????????
export const listen = (): void => {
    // Set the contract address
    const address = process.env.CONTRACT_ADDRESS!;

    // Create the connection
    const provider = new providers.JsonRpcProvider(process.env.PROVIDER_URL);

    // Create connection to wallet
    const wallet = new Wallet(process.env.WALLET_SECRET!, provider);

    // Construct and export the Nornir contract
    const nornir = new Contract(address, abi, wallet) as NornirContract;

    console.log(`Listening for events on ${process.env.PROVIDER_URL!}`);

    nornir.on('VikingReady', (requestId: number) => {
        console.log(`VikingReady - Request ID: ${requestId}`);

        nornir.generateViking(requestId, {
            gasPrice: 1000000000
        });
    });

    nornir.on('VikingGenerated', (id: BigNumber, vikingData: ActualVikingContractData): void => {
        console.log(`VikingGenerated: ${id.toNumber()}`);
        console.log(vikingData);

        // TODO helper

        const assetSpecs = VikingHelper.resolveAssetSpecs(vikingData);

        const number = id.toNumber();

        // TODO lololol wtf
        ImageHelper.composeImage(number, assetSpecs).then(async (imageUrl: string) => {
            const storage = VikingHelper.generateVikingStorage(number, imageUrl, vikingData);

            await VikingHelper.saveViking(storage);
        }, (err) => {
            console.error('COMPOSE IMAGE FAILED', err);
        });
    });
}
