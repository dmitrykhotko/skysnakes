import { Direction } from '../../common/enums';
import { LinkedPoint, ObjectWithId } from '../../common/types';
import { Action } from '../redux/actions';

export interface SnakeData extends ObjectWithId {
	head: LinkedPoint;
	tail: LinkedPoint;
	direction: Direction;
}

export interface DirectionWithId extends ObjectWithId {
	direction: Direction;
}

export interface ResultWitActions<T = boolean> {
	result: T;
	actions: Action[];
}
