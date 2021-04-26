import { APIModel } from './base.model';
import { APIQuery } from './utils/apiQuery.model';

/**
 * Abstract ModelTransformer, defining a common method of converting 'readable' Model representations into 'Broadcast' representations
 *
 * Usage implemented at the Controller level, enabling the transparent differentiation of Model representations as received/stored and as broadcast to
 *   the outside world, and centralising the logic to convert between the representations on a per-Model basis
 *
 * One Transformer should exist per Model which forms part of a Controller + Service + Model vertical slice
 *
 * @typeparam TModel the Model supertype to work with
 */
export abstract class ModelTransformer<TModel extends APIModel> {

    /**
     * Abstract upstream converter to be implemented by the subclass
     *
     * Goal is to take an as-read Read-format Model representation and convert it into an as-sent Broadcast-format representation
     *
     * @param data the Read-format data, retrieved from the database, to convert
     * @param select The Mongo Projection set, if it was provided in the GET query, enabling picking in implementation
     *
     * @returns the converted Broadcast-format data
     *
     * @typeparam T (autoinferred) the specific return type
     */
    public abstract convertForBroadcast<T = DeepPartial<TModel['broadcast']> | TModel['broadcast']>(
        data: TModel['read'], select?: APIQuery['select']
    ): T;

    /**
     * Abstract multi-Entity upstream converter, just passing all retrieved Read-format data through the single-Entity Broadcast converter
     *
     * @param data the array of Read-format data, retrieved from the database, to convert
     * @param select The Mongo Projection set, if it was provided in the GET query, enabling picking in implementation
     *
     * @returns the converted Broadcast-format data array
     *
     * @typeparam T (autoinferred) the specific return type
     */
    public convertManyForBroadcast<T = DeepPartial<TModel['broadcast']> | TModel['broadcast']>(
        data: Array<TModel['read']>, select?: APIQuery['select']
    ): Array<T> {

        return data.map((d) => this.convertForBroadcast(d, select));
    }
}
