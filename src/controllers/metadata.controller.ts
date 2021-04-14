import { Request } from 'express';
import { APIResponse } from '../types/apiResponse.type';
import { Metadata } from '../types/metadata.interface';
import { AbstractController } from './abstract.controller';

class MetadataController extends AbstractController {

    public async hello(req: Request): Promise<APIResponse> {
        // quick hack while we're not actually using Promises
        await new Promise(r => r(10));

        return {
            hello: 'metadata'
        };
    }

    public async metadataTest(): Promise<APIResponse> {
        // quick hack while we're not actually using Promises
        await new Promise(r => r(10));

        const data: Metadata = {
            name: 'Viking 567',
            description: 'A unique and special Viking!',
            external_link: '<link_to_viking_on_our_website>',
            image: '<ipfs_link_to_viking_image>',
            attributes: [
                // birthday
                {
                    display_type: 'date',
                    trait_type: 'Birthday',
                    value: 1546360800
                },
                // generation
                {
                    display_type: 'number',
                    trait_type: 'Generation',
                    value: 567
                },

                // body traits
                {
                    trait_type: 'Beard',
                    value: 'Goatee'
                },
                // body traits
                {
                    trait_type: 'Body',
                    value: 'Zombie'
                },
                // face traits
                {
                    trait_type: 'Face',
                    value: 'Happy'
                },
                // top traits
                {
                    trait_type: 'Top',
                    value: 'Shirt'
                },

                // boots traits
                {
                    trait_type: 'Boots Type',
                    value: 'Shoes'
                },
                {
                    trait_type: 'Boots Condition',
                    value: 'Damaged'
                },
                {
                    trait_type: 'Speed',
                    value: 60,
                    max_value: 99
                },

                // bottoms traits
                {
                    trait_type: 'Bottoms Type',
                    value: 'Shorts'
                },
                {
                    trait_type: 'Bottoms Condition',
                    value: 'None'
                },
                {
                    trait_type: 'Stamina',
                    value: 5,
                    max_value: 99
                },

                // helmet traits
                {
                    trait_type: 'Helmet Type',
                    value: 'Horned Helmet'
                },
                {
                    trait_type: 'Helmet Condition',
                    value: 'Worn'
                },
                {
                    trait_type: 'Intelligence',
                    value: 80,
                    max_value: 99
                },

                // shield traits
                {
                    trait_type: 'Shield Type',
                    value: 'Circle'
                },
                {
                    trait_type: 'Shield Condition',
                    value: 'Good'
                },
                {
                    trait_type: 'Defence',
                    value: 92,
                    max_value: 99
                },

                // weapon traits
                {
                    trait_type: 'Weapon Type',
                    value: 'Axe'
                },
                {
                    trait_type: 'Weapon Condition',
                    value: 'Perfect'
                },
                {
                    trait_type: 'Attack',
                    value: 98,
                    max_value: 99
                }
            ]
        };

        return data;
    }
}

export const metadataController = new MetadataController();
