import { TRACE_STATE } from '../utils/constants';
import { Observable } from '../utils/observable/observable';
import { Observer } from '../utils/observable/observer';
import { Action } from '.';
import { ArenaReducer } from './reducers/instances/arenaReducer';
import { InputReducer } from './reducers/instances/inputReducer';
import { SnakesReducer } from './reducers/instances/snakesReducer';
import { BulletsReducer } from './reducers/instances/bulletsReducer';
import { BinReducer } from './reducers/instances/binReducer';
import { StatReducer } from './reducers/instances/statReducer';
import { Reducer } from './reducers/reducer';
import { ReducerCollection } from './reducers/reducerCollection';

export type Store = Record<string, unknown>;

class State implements Observable {
	public dispatch: (...actions: Action[]) => State;

	private store: Store;
	private traceShift = '';
	private observers = {} as Record<string, Observer[]>;

	constructor(private reducer: Reducer<Store>) {
		this.dispatch = TRACE_STATE ? this.dispatchTrace : this.dispatchInternal;
		this.store = reducer.getInitialState();
	}

	get = <T extends Store>(): T => this.store as T;

	subscribe = (observer: Observer, type: string): State => {
		!this.observers[type] && (this.observers[type] = []);
		this.observers[type].push(observer);

		return this;
	};

	unsubscribe = (observer: Observer, type: string): State => {
		const observers = this.observers[type];
		const index = observers.indexOf(observer);
		!!~index && observers.splice(index, 1);

		return this;
	};

	unsubscribeByType = (type = ''): State => {
		if (type === '') {
			this.observers = {} as Record<string, Observer[]>;
		} else {
			this.observers[type] = [];
		}

		return this;
	};

	notify = (type: string, newStore: Store, oldStore: Store): void => {
		const observers = this.observers[type] || [];

		for (let i = 0; i < observers.length; i++) {
			observers[i](newStore, oldStore);
		}
	};

	private dispatchInternal = (...actions: Action[]): State => {
		const oldStore = this.store;

		for (let i = 0; i < actions.length; i++) {
			const action = actions[i];

			this.store = this.reducer.reduce(this.store, action);
			this.notify(action.type, this.store, oldStore);
		}

		return this;
	};

	private dispatchTrace = (...actions: Action[]): State => {
		this.trace('-----------------------------');
		this.trace(
			'dispatch: action',
			actions.reduce((acc, { type }) => `${acc} -> ${type}`, '')
		);
		this.trace('dispatch: old state', this.store);
		this.traceShift += '|   ';

		this.dispatchInternal(...actions);

		this.traceShift = this.traceShift.substring(0, this.traceShift.length - 4);
		this.trace('dispatch: new state', this.store);
		this.trace('-----------------------------');

		return this;
	};

	private trace = (message = '', ...args: unknown[]): void => {
		TRACE_STATE && console.log(`${this.traceShift}STATE ::: ${message}`, ...args);
	};
}

const reducer = new ReducerCollection(
	ArenaReducer,
	InputReducer,
	SnakesReducer,
	BulletsReducer,
	BinReducer,
	StatReducer
);
export const state = new State(reducer);
