import { SEND_DIRECTION, SET_HEAD, SET_SNAKE, SET_TAIL } from '../../../../utils/constants';
import { Direction, Player } from '../../../../utils/enums';
import { Point } from '../../../../utils/types';
import { SetActions } from './setActions';

export abstract class SnakesActions extends SetActions {
	static setSnake = super.setValueById<{ head: Point; tail: Point }, Player>(SET_SNAKE);
	static setHead = super.setValueById<Point, Player>(SET_HEAD);
	static setTail = super.setValueById<Point, Player>(SET_TAIL);
	static sendDirection = super.setValueById<Direction, Player>(SEND_DIRECTION);
}
