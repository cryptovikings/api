import mongoose, { Schema, SchemaDefinition, SchemaOptions, Document, PaginateModel } from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';
import mongoosePaginate from 'mongoose-paginate-v2';

/**
 * Base Entity Model, specifying the existence of a Mongo ID
 */
interface BaseModel {
    readonly _id: Schema.Types.ObjectId;
    readonly readonly: boolean;
    readonly readonlyOverrides: Array<string>;
}

/**
 * The base 'writeable' Model representation, signifying the basic makeup of a Model as passed to the Service and written to the database
 *
 * Models should be specified with a Write Type which extends this
 */
export type ModelWrite = Omit<BaseModel, '_id' | 'readonly' | 'readonlyOverrides'> & { readonly?: boolean };

/**
 * The base 'readable' Model representation, signifying the basic makeup of a Model as read from the database
 *
 * Models should be specified with a Read Type which extends this
 */
export type ModelRead = BaseModel & Document;

/**
 * The base 'broadcast' Model representation, signifying the basic makeup of a Model as broadcast to the outside world
 */
export type ModelBroadcast = Omit<BaseModel, '_id' | 'readonly' | 'readonlyOverrides'>;

/**
 * Supertype for packing the three Model representations into a single type structure for simplifying typeparams throughout the API's abstract classes
 */
export interface APIModel<
    TWrite extends ModelWrite = ModelWrite,
    TRead extends ModelRead = ModelRead,
    TBroadcast extends ModelBroadcast = ModelBroadcast
    > {

    readonly write: TWrite;
    readonly read: TRead;
    readonly broadcast: TBroadcast
}

/**
 * A ModelDescriptor for specifying a Model's makeup as passed to _createModel() (below)
 *
 * Incorporates the Model's name + collectionName, as well as its SchemaDefinition and SchemaOptions
 */
interface ModelDescriptor {
    readonly name: string;
    readonly schemaDefinition: SchemaDefinition;
    readonly readonly?: boolean;
    readonly readonlyOverrides?: Array<string>;
    readonly collectionName?: string;
    readonly schemaOptions?: SchemaOptions;
}

/**
 * Utility method for creating a Mongoose Model based on a given ModelDescriptor, incorproating the system's default definition as well as a
 *   standard set of Mongoose Plugins
 *
 * @param descriptor the ModelDescriptor
 *
 * @returns the PaginateModel
 */
export const _createModel = (descriptor: ModelDescriptor): PaginateModel<any> => {
    // base schema, defining properties all models will have
    const baseSchema: SchemaDefinition = {
        // allow a model to define readonly as default true in the descriptor
        readonly: { type: Boolean, default: descriptor.readonly ?? false },
        readonlyOverrides: { type: Array, default: descriptor.readonlyOverrides ?? [] }
    };

    // set up the Schema to incoroporate the MongooosePaginate and BeautifulUniqueValidation plugins
    const schema = new Schema(Object.assign(baseSchema, descriptor.schemaDefinition), descriptor.schemaOptions);
    schema.plugin(beautifyUnique);
    schema.plugin(mongoosePaginate);

    // configure the Model
    return mongoose.model(descriptor.name, schema, descriptor.collectionName);
}
