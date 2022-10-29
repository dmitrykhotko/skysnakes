import { GAME_RESET, NEW_DIRECTION, SET_HEAD, SET_SNAKE, SET_TAIL, REMOVE_SNAKE } from '../../../../utils/constants';
import { Direction, Player } from '../../../../utils/enums';
import { Action, SetValueAction, SetValueByIdAction } from '../..';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { Point, SnakeData } from '../../../../utils/types';
import { Hlp } from '../../../../utils';

export type SnakeState = SnakeData & { newDirection?: Direction; growthBuffer: number };

export type SnakesStore = {
	snakes: SnakeState[];
};

export abstract class SnakesReducer extends Reducer<SnakesStore> {
	private static initialState = {
		snakes: []
	} as SnakesStore;

	static getInitialState = (): SnakesStore => this.initialState;

	static reduce = (state: Store, action: Action): Store => {
		let propName: string;
		const { type } = action;

		switch (type) {
			case SET_SNAKE:
				return this.setSnake(state, action);
			case REMOVE_SNAKE:
				return {
					...state,
					snakes: [
						...Hlp.excludeById((state as SnakesStore).snakes, (action as SetValueAction<Player>).value)
					]
				};
			case SET_HEAD:
				propName = 'head';
				break;
			case SET_TAIL:
				propName = 'tail';
				break;
			case NEW_DIRECTION:
				propName = 'newDirection';
				break;
			case GAME_RESET:
				return { ...state, ...this.initialState };
			default:
				return state;
		}

		return this.setProperty(state, action, propName as keyof SnakeState);
	};

	private static setSnake = (state: Store, action: Action): SnakesStore => {
		const snakesState = state as SnakesStore;
		const { value } = action as SetValueAction<SnakeState>;

		return {
			...snakesState,
			snakes: [...Hlp.excludeById(snakesState.snakes, value.id), value]
		};
	};

	private static setProperty = <T extends Point | Direction>(
		state: Store,
		action: Action,
		pName: keyof SnakeState
	): SnakesStore => {
		const snakesState = state as SnakesStore;
		const { id, value } = action as SetValueByIdAction<T, Player>;
		const targetSnake = Hlp.getById(id, snakesState.snakes);

		return {
			...snakesState,
			snakes: [...Hlp.excludeById(snakesState.snakes, id), { ...targetSnake, ...{ [pName]: value } }]
		};
	};
}
