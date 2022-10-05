import { Action } from '../action';

export interface SetValueAction<T> extends Action {
	value: T;
}

export interface SetValueByIdAction<T, K> extends SetValueAction<T> {
	id: K;
}

export abstract class SetActions {
	static setEmpty =
		(type: string): (() => Action) =>
		(): { type: string } => ({
			type
		});

	static setValue =
		<T>(type: string): ((value: T) => SetValueAction<T>) =>
		(value: T): SetValueAction<T> => ({
			type,
			value
		});

	static setStaticValue =
		<T>(type: string, value: T): (() => SetValueAction<T>) =>
		(): SetValueAction<T> => ({
			type,
			value
		});

	static setValueById =
		<T, K>(type: string): ((value: T, id: K) => SetValueByIdAction<T, K>) =>
		(value: T, id: K): SetValueByIdAction<T, K> => ({
			type,
			value,
			id
		});
}
