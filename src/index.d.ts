declare type Contract = import('@ethersproject/contracts').Contract;
declare type Schema = import('mongoose').Schema;

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

/**
 * // TODO
 */
declare interface NornirContract extends Contract {
    generateViking(requestId: number, overrides: { gasPrice: number }): void;
}


/**
 * // TODO
 */
declare module 'mongoose-beautiful-unique-validation' {
    export default function (schema: Schema): void;
}
