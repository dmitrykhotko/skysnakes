import { Action } from '../modules/redux';
import { Strategy, PlayerMode, DrawGrid, Direction, MoveInput, FireInput, Player } from './enums';

export type GameState = {
	inProgress: boolean;
	coin: Point;
	snakes: SnakeData[];
	bullets: Bullet[];
	score: PlayersStat[];
	winners: Player[];
	bin: Point[];
};

export type Point = {
	x: number;
	y: number;
	next?: Point;
	prev?: Point;
};

export type SnakeData = {
	id: Player;
	head: Point;
	tail: Point;
	direction: Direction;
};

export type PlayersStat = {
	id: Id;
	lives: number;
	score: number;
};

export type Bullet = {
	id: Id;
	player: Player;
	point: Point;
	direction: Direction;
};

export type PlayerInput = FireInput | MoveInput;

export type Id = number;

export type PointWithId = { point: Point; id: Id };

export type DirectionWithId = { direction: Direction; id: Id };

export type ResultWitActions<T = boolean> = {
	result: T;
	actions: Action[];
};

export interface ObjectWithId {
	id: Id
}
