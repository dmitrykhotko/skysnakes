import {
	FLUSH_COINS_BUFFER,
	GAME_RESET,
	REMOVE_COIN,
	SET_COIN,
	SET_GAME_STATUS,
	SET_SIZE
} from '../../../utils/constants';
import { Coin, Id, Size } from '../../../utils/types';
import { Action, SetValueAction } from '../..';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { setValue } from '../utils';
import { GameStatus } from '../../../utils/enums';
import { Hlp } from '../../../utils';

export type ArenaState = {
	gameStatus: GameStatus;
	coins: Coin[];
	coinsBuffer: Coin[];
	size: Size;
};

export type ArenaStore = {
	arena: ArenaState;
};

export abstract class ArenaReducer extends Reducer<ArenaStore> {
	private static initialState = {
		arena: {
			gameStatus: GameStatus.InProgress,
			coins: [],
			coinsBuffer: [],
			size: { width: 0, height: 0 }
		}
	} as ArenaStore;

	static getInitialState = (): ArenaStore => this.initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;
		const arenaStore = state as ArenaStore;

		switch (type) {
			case SET_SIZE:
				return setValue(arenaStore, action, 'arena', 'size');
			case SET_COIN:
				return this.addCoin(state, action);
			case FLUSH_COINS_BUFFER:
				return {
					...state,
					arena: {
						...arenaStore.arena,
						coinsBuffer: []
					}
				};
			case REMOVE_COIN:
				return this.removeCoin(state, action);
			case SET_GAME_STATUS:
				return setValue(arenaStore, action, 'arena', 'gameStatus');
			case GAME_RESET:
				const { size } = arenaStore.arena;
				return { ...state, ...{ arena: { ...this.initialState.arena, size } } };
			default:
				return state;
		}
	};

	private static addCoin = (state: Store, action: Action): ArenaStore => {
		const arena = (state as ArenaStore).arena;
		const { value } = action as SetValueAction<Coin>;

		return {
			...state,
			arena: {
				...arena,
				coins: [...arena.coins, value],
				coinsBuffer: [...arena.coinsBuffer, value]
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
				coins: [...Hlp.excludeById(arena.coins, value)]
			}
		};
	};
}
