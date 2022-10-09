import {
	INC_COINS,
	INC_DEATHS,
	RESET_GAME,
	SET_COIN,
	SET_IN_PROGRESS,
	SET_LOOSERS,
	SET_SCORE,
	ADD_COINS
} from '../../../../utils/constants';
import { Player } from '../../../../utils/enums';
import { Point, Score } from '../../../../utils/types';
import { Action, SetValueAction, SetValueByIdAction } from '../..';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { setValue } from '../utils';
import { ArenaStrategy } from '../../../arena/strategies/arenaStrategy';
import { TransparentWallsStrategy } from '../../../arena/strategies';

export type ArenaState = {
	inProgress: boolean;
	coin: Point;
	loosers: Player[];
	score: Record<Player, Score>;
	strategy: ArenaStrategy;
};

export type ArenaStore = {
	arena: ArenaState;
};

const initialState = {
	arena: {
		inProgress: true,
		coin: { x: 0, y: 0 },
		loosers: [],
		score: {} as Record<Player, Score>,
		strategy: new TransparentWallsStrategy()
	}
} as ArenaStore;

const changeScore = (id: Player, store: ArenaStore, propName: string, value = 1): Store => {
	const { arena } = store;
	const { score } = arena;

	const playerScore = score[id];

	if (!playerScore) {
		return store;
	}

	return {
		...store,
		arena: {
			...arena,
			...{
				score: {
					...score,
					...{ [id]: { ...playerScore, ...{ [propName]: +playerScore[propName as keyof Score] + value } } }
				}
			}
		}
	};
};

export abstract class ArenaReducer extends Reducer<ArenaStore> {
	static getInitialState = (): ArenaStore => initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;
		const arenaStore = state as ArenaStore;
		let propName: string;

		switch (type) {
			case SET_COIN:
				propName = 'coin';
				break;
			case SET_IN_PROGRESS:
				propName = 'inProgress';
				break;
			case SET_LOOSERS:
				propName = 'loosers';
				break;
			case SET_SCORE:
				propName = 'score';
				break;
			case INC_COINS:
				return changeScore((action as SetValueAction<Player>).value, arenaStore, 'coins');
			case ADD_COINS:
				const { id, value } = action as SetValueByIdAction<number, Player>;
				return changeScore(id, arenaStore, 'coins', value);
			case INC_DEATHS:
				return changeScore((action as SetValueAction<Player>).value, arenaStore, 'deaths');
			case RESET_GAME:
				return { ...state, ...initialState };
			default:
				return state;
		}

		return setValue(arenaStore, action, 'arena', propName as keyof ArenaState);
	};
}
