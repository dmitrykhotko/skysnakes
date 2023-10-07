import { Action } from '../actions';
import { Store } from '../state';
import { Reducer } from './reducer';

export class ReducerCollection extends Reducer<Store> {
    private initialState: Store;
    private reducers: Reducer<Store>[];

    constructor(...reducers: Reducer<Store>[]) {
        super();

        this.reducers = reducers;
        this.initialState = this.reducers.reduce((acc, reducer) => {
            return { ...acc, ...reducer.getInitialState() };
        }, {} as Store);
    }

    getInitialState = (): Store => this.initialState;

    reduce = (state: Store, action: Action): Store => {
        return this.reducers.reduce((acc, reducer) => {
            return reducer.reduce(acc, action);
        }, state);
    };
}
