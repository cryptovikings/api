import { ErrorHelper } from '../helpers/error.helper';
import { APIResponse } from '../models/utils/apiResponse.model';
import { Viking } from '../models/viking/viking.model';
import { vikingTransformer } from '../models/viking/viking.transformer';
import { vikingService } from '../services/viking.service';
import { AbstractResourceController } from './abstract/abstractResource.controller';
import { VikingHelper } from '../helpers/viking.helper';

/**
 * The VikingController, designed to handle the /viking route collection and the viking metadata database Entity
 */
class VikingController extends AbstractResourceController<Viking> {

    /**
     * Default Mongo selection set, ensuring that Viking Number is always present in Viking data retrieved by find*()
     */
    protected readonly defaultSelect = ['number'];

    /**
     * Default Mongo sort set, ordering all multi-Viking finds by Viking Number when no other sorts are applied
     */
    protected readonly defaultSort = ['number'];

    /**
     * Default Viking Broadcast structure to be returned instead of a 404/Not Found on `GET /viking/{invalidNumber}`
     */
    protected readonly defaultData: Viking['broadcast'] = {
        number: -1,
        name: 'Unminted Viking',
        image: VikingHelper.getVikingImageUrl('viking_unknown'),
        texture: VikingHelper.getTextureImageUrl('viking_unknown'),
        // eslint-disable-next-line
        description: 'This CryptoViking is yet to make his way to Midgard! Come back when he\'s completed his journey to find out more about him! The CryptoVikings are a legion of truly-random, generative, hand-drawn NFTs. Residing on Polygon and employing Chainlink\'s VRF (Verifiable Random Function), we generate and store immutable statistics on-chain! Visit https://cryptovikings.io to learn more.',
        external_url: VikingHelper.getVikingExternalURL(-1),
        attributes: [
            {
                trait_type: 'Beard',
                value: 'TBC'
            },
            {
                trait_type: 'Body',
                value: 'TBC'
            },
            {
                trait_type: 'Face',
                value: 'TBC'
            },
            {
                trait_type: 'Top',
                value: 'TBC'
            },

            {
                trait_type: 'Boots Type',
                value: 'TBC'
            },
            {
                trait_type: 'Boots Condition',
                value: 'TBC'
            },
            {
                trait_type: 'Speed',
                value: 0,
                max_value: 99
            },

            {
                trait_type: 'Bottoms Type',
                value: 'TBC'
            },
            {
                trait_type: 'Bottoms Condition',
                value: 'TBC'
            },
            {
                trait_type: 'Stamina',
                value: 0,
                max_value: 99
            },

            {
                trait_type: 'Helmet Type',
                value: 'TBC'
            },
            {
                trait_type: 'Helmet Condition',
                value: 'TBC'
            },
            {
                trait_type: 'Intelligence',
                value: 0,
                max_value: 99
            },

            {
                trait_type: 'Shield Type',
                value: 'TBC'
            },
            {
                trait_type: 'Shield Condition',
                value: 'TBC'
            },
            {
                trait_type: 'Defence',
                value: 0,
                max_value: 99
            },

            {
                trait_type: 'Weapon Type',
                value: 'TBC'
            },
            {
                trait_type: 'Weapon Condition',
                value: 'TBC'
            },
            {
                trait_type: 'Attack',
                value: 0,
                max_value: 99
            }
        ]
    }

    /**
     * Constructor. Specify the use of the VikingService, VikingTransformer and set the unique identifier as 'number'
     */
    constructor() {
        super(vikingService, vikingTransformer, 'number');
    }

    /**
     * Override the abstract create() and throw a NotImplementedError, preventing accidental wiring up of (VikingController).create
     */
    public create(): Promise<APIResponse<Viking['broadcast']>> {
        throw ErrorHelper.errors.notImplemented;
    }

    /**
     * Override the abstract update() and throw a NotImplementedError, preventing accidental wiring up of (VikingController).update
     */
    public update(): Promise<APIResponse<Viking['broadcast']>> {
        throw ErrorHelper.errors.notImplemented;
    }

    /**
     * Override the abstract delete() and throw a NotImplementedError, preventing accidental wiring up of (VikingController).delete
     */
    public delete(): Promise<APIResponse<{ deleted: number }>> {
        throw ErrorHelper.errors.notImplemented;
    }
}

/** Export a singleton of the VikingController so that we can reference its instance methods in Router configuration */
export const vikingController = new VikingController();
