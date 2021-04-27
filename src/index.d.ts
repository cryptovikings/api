declare type Schema = import('mongoose').Schema;
declare type Contract = import('ethers').Contract;
declare type BigNumber = import('ethers').BigNumber;
declare type ContractFunction = import('ethers').ContractFunction;
declare type VikingContractData = import('./models/viking/vikingContract.model').VikingContractModel;

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

/**
 * Contract definition, extending `ethers.Contract`, and adding correctly-typed and strict signatures for known ABI hooks
 */
declare interface NornirContract extends Contract {
    // override the `functions` property of ethers.Contract to add our methods
    functions: {
        /** ERC-721 `totalSupply()` */
        totalSupply(): Promise<Array<BigNumber>>;

        /** getter for Contract Viking array element */
        vikings(id: number): Promise<VikingContractData>;

        /** getter for Contract internal vikingCount */
        vikingCount(): Promise<Array<BigNumber>>;

        /** Contract generateViking() */
        generateViking(id: BigNumber, overrides?: { gasPrice?: number }): Promise<void>;

        // re-implement the arbitrary index found in the original definition
        [name: string]: ContractFunction;
    }
}

/**
 * Type declaration for `mongoose-beautiful-unique-validation` plugin
 */
declare module 'mongoose-beautiful-unique-validation' {
    export default function (schema: Schema): void;
}
