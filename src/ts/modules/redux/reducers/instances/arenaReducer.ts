import { GAME_RESET, REMOVE_COIN, SET_COIN, SET_GAME_STATUS } from '../../../../utils/constants';
import { Coin, Id } from '../../../../utils/types';
import { Action, SetValueAction } from '../..';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { setValue } from '../utils';
import { GameStatus } from '../../../../utils/enums';
import { Hlp } from '../../../../utils';

export type ArenaState = {
	gameStatus: GameStatus;
	coins: Coin[];
};

export type ArenaStore = {
	arena: ArenaState;
};

export abstract class ArenaReducer extends Reducer<ArenaStore> {
	private static initialState = {
		arena: {
			gameStatus: GameStatus.InProgress,
			coins: []
		}
	} as ArenaStore;

	static getInitialState = (): ArenaStore => this.initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;
		const arenaStore = state as ArenaStore;

		let propName: string;

		switch (type) {
			case SET_COIN:
				return this.addCoin(state, action);
			case REMOVE_COIN:
				return this.removeCoin(state, action);
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

	private static addCoin = (state: Store, action: Action): ArenaStore => {
		const arena = (state as ArenaStore).arena;
		const { value } = action as SetValueAction<Coin>;

		return {
			...state,
			arena: {
				...arena,
				coins: [...arena.coins, value]
			}
		};
	};

	private static removeCoin = (state: Store, action: Action): ArenaStore => {
		const arena = (state as ArenaStore).arena;
		const { value } = action as SetValueAction<Id>;

		return {
			...state,
			arena: {
				...arena,
				coins: [...Hlp.filterById(value, arena.coins)]
			}
		};
	};
}
