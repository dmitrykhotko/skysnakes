import { TRACE_STATE } from '../../utils/constants';
import { Observable } from '../observable/observable';
import { Observer } from '../observable/observer';
import { Action } from './';
import { ArenaReducer } from './reducers/instances/arena';
import { InputReducer } from './reducers/instances/input';
import { SettingsReducer } from './reducers/instances/settings';
import { SnakesReducer } from './reducers/instances/snakes';
import { ShootingReducer } from './reducers/instances/shooting';
import { Reducer } from './reducers/reducer';
import { ReducerCollection } from './reducers/reducerCollection';

export type Store = Record<string, unknown>;

class State implements Observable {
	public dispatch: (...actions: Action[]) => void;

	private store: Store;
	private traceShift = '';
	private observers = {} as Record<string, Observer[]>;

	constructor(private reducer: Reducer<Store>) {
		const dispatch = TRACE_STATE ? this.traceDispatch : this.dispatchInternal;

		this.store = reducer.getInitialState();
		this.dispatch = (...actions: Action[]): void => (actions.length && dispatch(...actions)) as void;
	}

	get = <T extends Store>(): T => this.store as T;

	subscribe = (observer: Observer, type: string): void => {
		!this.observers[type] && (this.observers[type] = []);
		this.observers[type].push(observer);
	};

	unsubscribe = (observer: Observer, type: string): void => {
		const observers = this.observers[type];
		const index = observers.indexOf(observer);
		!!~index && observers.splice(index, 1);
	};

	unsubscribeByType = (type = ''): void => {
		if (type === '') {
			this.observers = {} as Record<string, Observer[]>;
		} else {
			this.observers[type] = [];
		}
	};

	notify = (type: string, newStore: Store, oldStore: Store): void => {
		const observers = this.observers[type] || [];

		for (let i = 0; i < observers.length; i++) {
			observers[i](newStore, oldStore);
		}
	};

	private dispatchInternal = (...actions: Action[]): void => {
		const oldStore = this.store;

		for (let i = 0; i < actions.length; i++) {
			const action = actions[i];

			this.store = this.reducer.reduce(this.store, action);
			this.notify(action.type, this.store, oldStore);
		}
	};

	private traceDispatch = (...actions: Action[]): void => {
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
	};

	private trace = (message = '', ...args: unknown[]): void => {
		TRACE_STATE && console.log(`${this.traceShift}STATE ::: ${message}`, ...args);
	};
}

const reducer = new ReducerCollection(ArenaReducer, SettingsReducer, InputReducer, SnakesReducer, ShootingReducer);
export const state = new State(reducer);
