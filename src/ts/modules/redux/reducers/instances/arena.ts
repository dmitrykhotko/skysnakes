import {
	INC_COINS,
	INC_DEATHS,
	SET_COIN,
	SET_IN_PROGRESS,
	SET_LOOSERS,
	SET_SCORE,
	SET_SCORE_INITIALIZED,
	SET_STRATEGY
} from '../../../../utils/constants';
import { Player } from '../../../../utils/enums';
import { Point, Score } from '../../../../utils/types';
import { Action, SetValueAction } from '../..';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { buildState } from '../utils';
import { ArenaStrategy } from '../../../arena/strategies/arenaStrategy';
import { TransparentWallsStrategy } from '../../../arena/strategies';

export type ArenaStore = {
	arena: {
		inProgress: boolean;
		coin: Point;
		loosers: Player[];
		scoreInitialized?: boolean;
		score: Record<Player, Score>;
		strategy: ArenaStrategy;
	};
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

const incScore = (action: Action, store: Store, propName: string): Store => {
	const { value: id } = action as SetValueAction<Player>;
	const { arena } = store as ArenaStore;
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
					...{ [id]: { ...playerScore, ...{ [propName]: +playerScore[propName as keyof Score] + 1 } } }
				}
			}
		}
	};
};

export abstract class ArenaReducer extends Reducer<ArenaStore> {
	static getInitialState = (): ArenaStore => initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;
		const arenaState = state as ArenaStore;
		const buildArenaState = (pName: string) => buildState(arenaState, action, 'arena', pName);

		switch (type) {
			case SET_COIN:
				return buildArenaState('coin');
			case SET_IN_PROGRESS:
				return buildArenaState('inProgress');
			case SET_LOOSERS:
				return buildArenaState('loosers');
			case SET_SCORE_INITIALIZED:
				return buildArenaState('scoreInitialized');
			case SET_SCORE:
				return buildArenaState('score');
			case SET_STRATEGY:
				return buildArenaState('strategy');
			case INC_COINS:
				return incScore(action, state, 'coins');
			case INC_DEATHS:
				return incScore(action, state, 'deaths');
			default:
				return state;
		}
	};
}
