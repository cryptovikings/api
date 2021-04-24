declare type Schema = import('mongoose').Schema;
declare type Contract = import('ethers').Contract;
declare type BigNumber = import('ethers').BigNumber;
declare type ContractFunction = import('ethers').ContractFunction;
declare type ActualVikingContractData = import('./models/vikingContractData.model').ActualVikingContractData;

/**
 * // TODO
 */
declare type DeepPartial<T> = {
    [K in keyof T]?: DeepPartial<T[K]>;
}

/**
 * // TODO
 */
declare type DeepRequired<T> = {
    [K in keyof T]-?: DeepRequired<T[K]>;
}

// add specific signatures to `ethers.Contract.functions` for type-safety
// note: not using a pattern like `vikings: ContractFunction<ActualVikingContractData>`
// reason: ContractFunction args are `(...args: any[])` and we want to be stricter
// compatibility: ContractFunction return type is `Promise<{specified_type}>`
declare interface NornirContract extends Contract {
    // override the `functions` property of Contract
    functions: {
        totalSupply(): Promise<Array<BigNumber>>;
        vikings(id: number): Promise<ActualVikingContractData>;

        // re-implement the arbitrary index found in the original definition
        [name: string]: ContractFunction;
    }
}

/**
 * // TODO
 */
declare module 'mongoose-beautiful-unique-validation' {
    export default function (schema: Schema): void;
}
