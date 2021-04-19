import { Select } from '../apiQuery.model';
import { ModelBroadcast, ModelRead } from '../mongoose/base.model';

export abstract class ModelTransformer<TRead extends ModelRead, TBroadcast extends ModelBroadcast> {

    public abstract convertForBroadcast(data: TRead, select: Select): DeepPartial<TBroadcast>;

    public convertManyForBroadcast(data: Array<TRead>, select: Select): Array<DeepPartial<TBroadcast>> {
        return data.map((d) => this.convertForBroadcast(d, select));
    }
}
