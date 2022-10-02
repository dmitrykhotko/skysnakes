import { SEND_DIRECTION, SET_HEAD, SET_SNAKE, SET_TAIL } from '../../../../utils/constants';
import { Direction, Player } from '../../../../utils/enums';
import { Action, SetValueByIdAction } from '../..';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { Point, SnakeState } from '../../../../utils/types';

export type SnakesStore = {
	snakes: Record<Player, SnakeState & { newDirection: Direction }>;
};

const initialState = {
	snakes: {}
} as SnakesStore;

const setData = <T extends Point | Direction>(state: Store, action: Action, pName: string): SnakesStore => {
	const snakesState = state as SnakesStore;
	const { id, value } = action as SetValueByIdAction<T, Player>;

	return {
		...snakesState,
		snakes: {
			...snakesState.snakes,
			[id]: {
				...snakesState.snakes[id],
				[pName]: value
			}
		}
	};
};

const setSnake = (state: Store, action: Action): SnakesStore => {
	const snakesState = state as SnakesStore;
	const { id, value } = action as SetValueByIdAction<Point, Player>;

	return {
		...snakesState,
		snakes: {
			...snakesState.snakes,
			[id]: value
		}
	};
};

export abstract class SnakesReducer extends Reducer<SnakesStore> {
	static getInitialState = (): SnakesStore => initialState;

	static reduce = (state: Store, action: Action): Store => {
		let propName: string;
		const { type } = action;

		switch (type) {
			case SET_SNAKE:
				return setSnake(state, action);
			case SET_HEAD:
				propName = 'head';
				break;
			case SET_TAIL:
				propName = 'tail';
				break;
			case SEND_DIRECTION:
				propName = 'newDirection';
				break;
			default:
				return state;
		}

		return setData(state, action, propName);
	};
}
