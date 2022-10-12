import { NEW_DIRECTION, REMOVE_SNAKE, SET_HEAD, SET_SNAKE, SET_TAIL } from '../../../../utils/constants';
import { Direction, Player } from '../../../../utils/enums';
import { Point, SnakeData } from '../../../../utils/types';
import { SetActions } from './setActions';

export abstract class SnakesActions extends SetActions {
	static setSnake = super.setValue<SnakeData>(SET_SNAKE);
	static removeSnake = super.setValue<Player>(REMOVE_SNAKE);
	static setHead = super.setValueById<Point, Player>(SET_HEAD);
	static setTail = super.setValueById<Point, Player>(SET_TAIL);
	static newDirection = super.setValueById<Direction | undefined, Player>(NEW_DIRECTION);
}
