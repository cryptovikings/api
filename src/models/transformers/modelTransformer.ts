import { ModelBroadcast, ModelRead } from '../mongoose/base.model';

export abstract class ModelTransformer<TRead extends ModelRead, TBroadcast extends ModelBroadcast> {

    public abstract convertForBroadcast(data: TRead): TBroadcast;

    public convertManyForBroadcast(data: Array<TRead>): Array<TBroadcast> {
        return data.map((d) => this.convertForBroadcast(d));
    }
}
