import { Schema, SchemaDefinition, SchemaOptions, Document } from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';
import mongoosePaginate from 'mongoose-paginate-v2';

interface BaseModel {
    _id: Schema.Types.ObjectId;
}

export type ModelSchema = Omit<BaseModel, '_id'>;

export type ModelDocument = BaseModel & Document;

export const _createSchema = (definition: SchemaDefinition, options?: SchemaOptions): Schema => {
    const schema = new Schema(definition, options);

    schema.plugin(beautifyUnique);
    schema.plugin(mongoosePaginate);

    return schema;
}
