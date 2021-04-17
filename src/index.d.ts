declare type Schema = import('mongoose').Schema;

declare module 'mongoose-beautiful-unique-validation' {
    export default function (schema: Schema): void;
}
