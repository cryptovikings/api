import { Select } from '../apiQuery.model';
import { ModelBroadcast, ModelRead } from '../mongoose/base.model';

export abstract class ModelTransformer<TRead extends ModelRead, TBroadcast extends ModelBroadcast> {

    public abstract convertForBroadcast<T = DeepPartial<TBroadcast> | TBroadcast>(
        data: TRead, select?: Select
    ): T;

    public convertManyForBroadcast<T = DeepPartial<TBroadcast> | TBroadcast>(
        data: Array<TRead>, select?: Select
    ): Array<T> {

        return data.map((d) => this.convertForBroadcast(d, select));
    }
}
