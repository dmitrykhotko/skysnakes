import { Direction, Player } from '../../../../common/enums';
import { LinkedPoint } from '../../../../common/types';
import { SnakeState } from '../../reducers/instances/snakesReducer';
import { ActionType } from '../actionType';
import { SetActions } from './setActions';

export abstract class SnakesActions extends SetActions {
    static setSnake = super.setValue<SnakeState>(ActionType.SET_SNAKE);
    static removeSnake = super.setValue<Player>(ActionType.REMOVE_SNAKE);
    static setHead = super.setValueById<LinkedPoint, Player>(ActionType.SET_HEAD);
    static setTail = super.setValueById<LinkedPoint, Player>(ActionType.SET_TAIL);
    static newDirection = super.setValueById<Direction | undefined, Player>(ActionType.NEW_DIRECTION);
}
