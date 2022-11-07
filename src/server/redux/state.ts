import { Action } from './actions';
// import { Observer } from '../../common/types';
import { TRACE_STATE } from '../utils/constants';
import { ArenaReducer } from './reducers/instances/arenaReducer';
import { BinReducer } from './reducers/instances/binReducer';
import { BulletsReducer } from './reducers/instances/bulletsReducer';
import { SnakesReducer } from './reducers/instances/snakesReducer';
import { StatReducer } from './reducers/instances/statReducer';
import { Reducer } from './reducers/reducer';
import { ReducerCollection } from './reducers/reducerCollection';
// import { ActionType } from './actions/actionType';

export type Store = Record<string, unknown>;

export interface State {
	dispatch: (...actions: Action[]) => void;
	get: <T extends Store>() => T;
	// subscribe: (observer: Observer, type: ActionType) => void;
	// unsubscribe: (observer: Observer, type: ActionType) => void;
}

class ReduxState implements State {
	public dispatch: (...actions: Action[]) => void;

	private store!: Store;
	private traceShift = '';
	// private observers = {} as Record<ActionType, Observer[]>;

	constructor(private reducer: Reducer<Store>) {
		this.dispatch = TRACE_STATE ? this.dispatchTrace : this.dispatchInternal;
		this.store = this.reducer.getInitialState();
	}

	get = <T extends Store>(): T => this.store as T;

	// subscribe = (observer: Observer, type: ActionType): void => {
	// 	!this.observers[type] && (this.observers[type] = []);
	// 	this.observers[type].push(observer);
	// };

	// unsubscribe = (observer: Observer, type: ActionType): void => {
	// 	const observers = this.observers[type];
	// 	const index = observers.indexOf(observer);
	// 	!!~index && observers.splice(index, 1);
	// };

	// unsubscribeByType = (type?: ActionType): State => {
	// 	if (type) {
	// 		this.observers = {} as Record<ActionType, Observer[]>;
	// 	} else {
	// 		this.observers[type] = [];
	// 	}

	// 	return this;
	// };

	// private notify = (type: ActionType, newStore: Store, oldStore: Store): void => {
	// 	const observers = this.observers[type] || [];

	// 	for (let i = 0; i < observers.length; i++) {
	// 		observers[i](newStore, oldStore);
	// 	}
	// };

	private dispatchInternal = (...actions: Action[]): void => {
		// const oldStore = this.store;

		for (let i = 0; i < actions.length; i++) {
			const action = actions[i];

			this.store = this.reducer.reduce(this.store, action);
			// this.notify(action.type, this.store, oldStore);
		}
	};

	private dispatchTrace = (...actions: Action[]): void => {
		this.trace('-----------------------------');
		this.trace(
			'dispatch: action',
			actions.reduce((acc, { type }) => `${acc} -> ${type}`, '')
		);
		// this.trace('dispatch: old state', this.store);
		this.traceShift += '|   ';

		this.dispatchInternal(...actions);

		this.traceShift = this.traceShift.substring(0, this.traceShift.length - 4);
		// this.trace('dispatch: new state', this.store);
		this.trace('-----------------------------');
	};

	private trace = (message = '', ...args: unknown[]): void => {
		TRACE_STATE && console.log(`${this.traceShift}STATE ::: ${message}`, ...args);
	};
}

const reducer = new ReducerCollection(ArenaReducer, SnakesReducer, BulletsReducer, BinReducer, StatReducer);

export const createState = (): State => new ReduxState(reducer);
