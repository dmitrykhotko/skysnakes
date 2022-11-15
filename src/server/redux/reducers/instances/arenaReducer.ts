import { Action, SetValueAction } from '../../actions';
import { GameStatus } from '../../../../common/enums';
import { Coin, Id, Size } from '../../../../common/types';
import { Hlp } from '../../../utils/hlp';
import { ActionType } from '../../actions/actionType';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { setValue } from '../utils';
import { InitialData } from '../../../utils/types';

export type ArenaState = {
	status: GameStatus;
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
			status: GameStatus.Finish,
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
			case ActionType.SET_SIZE:
				return setValue(arenaStore, action, 'arena', 'size');
			case ActionType.SET_COIN:
				return this.addCoin(state, action);
			case ActionType.FLUSH_COINS_BUFFER:
				return {
					...state,
					arena: {
						...arenaStore.arena,
						coinsBuffer: []
					}
				};
			case ActionType.REMOVE_COIN:
				return this.removeCoin(state, action);
			case ActionType.SET_GAME_STATUS:
				return setValue(arenaStore, action, 'arena', 'status');
			case ActionType.GAME_RESET:
				const { size } = (action as SetValueAction<InitialData>).value;
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
