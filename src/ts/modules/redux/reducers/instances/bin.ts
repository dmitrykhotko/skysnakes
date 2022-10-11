import { MOVE_TO_BIN, EMPTY_BIN } from '../../../../utils/constants';
import { Point } from '../../../../utils/types';
import { Action, SetValueAction } from '../..';
import { Store } from '../../state';
import { Reducer } from '../reducer';

export type BinState = Point[];

export type BinStore = {
	bin: BinState;
};

export abstract class BinReducer extends Reducer<BinStore> {
	private static initialState = {
		bin: []
	} as BinStore;

	static getInitialState = (): BinStore => this.initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;
		const binStore = state as BinStore;
		let bin: BinState;

		switch (type) {
			case MOVE_TO_BIN:
				bin = [...binStore.bin, ...(action as SetValueAction<Point[]>).value];
				break;
			case EMPTY_BIN:
				bin = [];
				break;
			default:
				return state;
		}

		return {
			...state,
			bin
		};
	};
}
