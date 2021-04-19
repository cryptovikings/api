import mongoose, { Schema, SchemaDefinition, SchemaOptions, Document, PaginateModel } from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';
import mongoosePaginate from 'mongoose-paginate-v2';

/**
 * Base Entity Model, specifying the existence of a Mongo ID
 */
interface BaseModel {
    _id: Schema.Types.ObjectId;
}

/**
 * The base 'writeable' Model representation, signifying the basic makeup of a Model as passed to the Service and written to the database
 *
 * Models should be specified with a Write Type which extends this
 */
export type ModelWrite = Omit<BaseModel, '_id'>;

/**
 * The base 'readable' Model representation, signifying the basic makeup of a Model as read from the database
 *
 * Models should be specified with a Read Type which extends this
 */
export type ModelRead = BaseModel & Document;

/**
 * The base 'broadcast' Model representation, signifying the basic makeup of a Model as broadcast to the outside world
 */
export type ModelBroadcast = Omit<BaseModel, '_id'>;

/**
 * A ModelDescriptor for specifying a Model's makeup as passed to _createModel() (below)
 *
 * Incorporates the Model's name + collectionName, as well as its SchemaDefinition and SchemaOptions
 */
interface ModelDescriptor {
    name: string;
    collectionName?: string;
    schemaDefinition: SchemaDefinition;
    schemaOptions?: SchemaOptions;
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
    // set up the Schema to incoroporate the MongooosePaginate and BeautifulUniqueValidation plugins
    const schema = new Schema(descriptor.schemaDefinition, descriptor.schemaOptions);
    schema.plugin(beautifyUnique);
    schema.plugin(mongoosePaginate);

    // configure the Model
    return mongoose.model(descriptor.name, schema, descriptor.collectionName);
}
