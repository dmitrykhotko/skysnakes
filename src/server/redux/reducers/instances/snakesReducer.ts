import { CmHlp } from '../../../../common/cmHlp';
import { Direction, Player } from '../../../../common/enums';
import { LinkedPoint } from '../../../../common/types';
import { Hlp } from '../../../utils/hlp';
import { SnakeData } from '../../../utils/types';
import { Action, SetValueAction, SetValueByIdAction } from '../../actions';
import { ActionType } from '../../actions/actionType';
import { Store } from '../../state';
import { Reducer } from '../reducer';

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
            case ActionType.SET_SNAKE:
                return this.setSnake(state, action);
            case ActionType.REMOVE_SNAKE:
                return {
                    ...state,
                    snakes: [
                        ...Hlp.excludeById((state as SnakesStore).snakes, (action as SetValueAction<Player>).value)
                    ]
                };
            case ActionType.SET_HEAD:
                propName = 'head';
                break;
            case ActionType.SET_TAIL:
                propName = 'tail';
                break;
            case ActionType.NEW_DIRECTION:
                propName = 'newDirection';
                break;
            case ActionType.GAME_RESET:
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

    private static setProperty = <T extends LinkedPoint | Direction>(
        state: Store,
        action: Action,
        pName: keyof SnakeState
    ): SnakesStore => {
        const snakesState = state as SnakesStore;
        const { id, value } = action as SetValueByIdAction<T, Player>;
        const targetSnake = CmHlp.getById(id, snakesState.snakes);

        return {
            ...snakesState,
            snakes: [...Hlp.excludeById(snakesState.snakes, id), { ...targetSnake, ...{ [pName]: value } }]
        };
    };
}
