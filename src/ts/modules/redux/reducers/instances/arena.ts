import {
	INC_SCORE,
	INC_DEATHS,
	RESET_GAME,
	SET_COIN,
	SET_IN_PROGRESS,
	SET_LOOSERS,
	SET_SCORE,
	ADD_SCORE
} from '../../../../utils/constants';
import { Player } from '../../../../utils/enums';
import { Point, PlayersStat } from '../../../../utils/types';
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
	playersStat: Record<Player, PlayersStat>;
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
		playersStat: {} as Record<Player, PlayersStat>,
		strategy: new TransparentWallsStrategy()
	}
} as ArenaStore;

const changeStat = (id: Player, store: ArenaStore, propName: string, value = 1): Store => {
	const { arena } = store;
	const { playersStat } = arena;

	const playerScore = playersStat[id];

	if (!playerScore) {
		return store;
	}

	const stateVal = {
		...store,
		arena: {
			...arena,
			...{
				playersStat: {
					...playersStat,
					...{
						[id]: {
							...playerScore,
							...{ [propName]: +playerScore[propName as keyof PlayersStat] + value }
						}
					}
				}
			}
		}
	};

	console.log('stateVal: ', stateVal);

	return stateVal;
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
				propName = 'playersStat';
				break;
			case INC_SCORE:
				return changeStat((action as SetValueAction<Player>).value, arenaStore, 'score');
			case ADD_SCORE:
				const { id, value } = action as SetValueByIdAction<number, Player>;
				return changeStat(id, arenaStore, 'score', value);
			case INC_DEATHS:
				return changeStat((action as SetValueAction<Player>).value, arenaStore, 'deaths');
			case RESET_GAME:
				return { ...state, ...initialState };
			default:
				return state;
		}

		return setValue(arenaStore, action, 'arena', propName as keyof ArenaState);
	};
}
