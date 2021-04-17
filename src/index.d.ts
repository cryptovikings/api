declare type Schema = import('mongoose').Schema;

declare type DeepPartial<T> = {
    [K in keyof T]?: DeepPartial<T[K]>;
}

declare type DeepRequired<T> = {
    [K in keyof T]-?: DeepRequired<T[K]>;
}

declare module 'mongoose-beautiful-unique-validation' {
    export default function (schema: Schema): void;
}
