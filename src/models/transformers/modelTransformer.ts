import { Select } from '../apiQuery.model';
import { APIModel } from '../mongoose/base.model';

export abstract class ModelTransformer<TModel extends APIModel> {

    public abstract convertForBroadcast<T = DeepPartial<TModel['broadcast']> | TModel['broadcast']>(
        data: TModel['read'], select?: Select
    ): T;

    public convertManyForBroadcast<T = DeepPartial<TModel['broadcast']> | TModel['broadcast']>(
        data: Array<TModel['read']>, select?: Select
    ): Array<T> {

        return data.map((d) => this.convertForBroadcast(d, select));
    }
}
