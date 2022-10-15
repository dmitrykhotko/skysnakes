import { GAME_RESET, SET_COIN, SET_GAME_STATUS } from '../../../../utils/constants';
import { Point } from '../../../../utils/types';
import { Action } from '../..';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { setValue } from '../utils';
import { GameStatus } from '../../../../utils/enums';

export type ArenaState = {
	gameStatus: GameStatus;
	coin: Point;
};

export type ArenaStore = {
	arena: ArenaState;
};

export abstract class ArenaReducer extends Reducer<ArenaStore> {
	private static initialState = {
		arena: {
			gameStatus: GameStatus.InProgress,
			coin: { x: 0, y: 0 }
		}
	} as ArenaStore;

	static getInitialState = (): ArenaStore => this.initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;
		const arenaStore = state as ArenaStore;

		let propName: string;

		switch (type) {
			case SET_COIN:
				propName = 'coin';
				break;
			case SET_GAME_STATUS:
				propName = 'gameStatus';
				break;
			case GAME_RESET:
				return { ...state, ...this.initialState };
			default:
				return state;
		}

		return setValue(arenaStore, action, 'arena', propName as keyof ArenaState);
	};
}
