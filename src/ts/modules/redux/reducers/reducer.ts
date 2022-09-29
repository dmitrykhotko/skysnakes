import { Action } from '..';
import { Store } from '../state';

export abstract class Reducer<T extends Store> {
	abstract getInitialState: () => T;
	abstract reduce: (state: Store, action: Action) => Store;
}
