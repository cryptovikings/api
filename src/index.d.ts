declare type Schema = import('mongoose').Schema;
declare type Contract = import('ethers').Contract;
declare type BigNumber = import('ethers').BigNumber;
declare type ContractFunction = import('ethers').ContractFunction;
declare type TransactionResponse = import('@ethersproject/abstract-provider').TransactionResponse;
declare type VikingStats = import('./models/viking/vikingStructs.model').VikingStats;
declare type VikingComponents = import('./models/viking/vikingStructs.model').VikingComponents;
declare type VikingConditions = import('./models/viking/vikingStructs.model').VikingConditions;

/**
 * Recursive Partial for making deeply nested properties optional
 */
declare type DeepPartial<T> = {
    [K in keyof T]?: DeepPartial<T[K]>;
}

/**
 * Recursive Required for making deeply nested properties required
 */
declare type DeepRequired<T> = {
    [K in keyof T]-?: DeepRequired<T[K]>;
}

/** String union for possible values of ClothesCondition */
declare type ClothesCondition = 'TBC' | 'Standard' | 'Ragged' | 'Rough' | 'Used' | 'Good' | 'Perfect';

/** String union for possible values of ItemCondition */
declare type ItemCondition = 'TBC' | 'None' | 'Destroyed' | 'Battered' | 'War Torn' | 'Battle Ready' | 'Flawless';

/**
 * Contract definition, extending `ethers.Contract`, and adding correctly-typed and strict signatures for known ABI hooks
 */
declare interface NornirContract extends Contract {
    /** Contract generateViking() */
    generateViking(id: BigNumber | number, overrides?: { gasPrice?: number }): Promise<TransactionResponse>;

    /** Contract resolveViking() */
    resolveViking(id: BigNumber | number, overrides?: { gasPrice?: number }): Promise<TransactionResponse>;

    /** Contract completeViking() */
    completeViking(id: BigNumber | number, overrides?: { gasPrice?: number }): Promise<TransactionResponse>;

    // override the `functions` property of ethers.Contract to add our methods
    functions: {
        /** ERC-721 `totalSupply()` */
        totalSupply(): Promise<Array<BigNumber>>;

        /** getter for all Viking data */
        getVikingData(id: number): Promise<[VikingStats, VikingComponents, VikingConditions]>;

        /** getter for Contract VikingStats mapping by ID */
        vikingStats(id: number): Promise<VikingStats>;

        /** getter for Contract VikingComponents mapping by ID */
        vikingComponents(id: number): Promise<VikingComponents>;

        /** getter for Contract VikingConditions mapping by ID */
        vikingConditions(id: number): Promise<VikingConditions>;

        /** getter for Contract generatedVikingCount */
        generatedVikingCount(): Promise<Array<BigNumber>>;

        /** getter for Contract resolvedVikingCount */
        resolvedVikingCount(): Promise<Array<BigNumber>>;
    }
}

/**
 * Type declaration for `mongoose-beautiful-unique-validation` plugin
 */
declare module 'mongoose-beautiful-unique-validation' {
    export default function (schema: Schema): void;
}
