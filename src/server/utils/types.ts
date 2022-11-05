// get ri of server dependency
import { Direction, Player } from '../../common/enums';
import { Id, LinkedPoint } from '../../common/types';
import { Action } from '../redux';

export type SnakeData = {
	id: Player;
	head: LinkedPoint;
	tail: LinkedPoint;
	direction: Direction;
};

export type DirectionWithId = { direction: Direction; id: Id };

export type ResultWitActions<T = boolean> = {
	result: T;
	actions: Action[];
};

export interface ObjectWithId {
	id: Id;
}
