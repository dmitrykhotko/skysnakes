import { Action } from '../modules/redux';
import { Direction, MoveInput, FireInput, Player, GameStatus } from './enums';

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

export type Id = number;

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

export type PointWithId = { point: Point; id: Id };

export type Coin = PointWithId;

export type GameState = {
	gameStatus: GameStatus;
	coins: Coin[];
	snakes: SnakeData[];
	bullets: Bullet[];
	playersStat: PlayersStat[];
	winners: Player[];
	bin: Point[];
};

export type DirectionWithId = { direction: Direction; id: Id };

export type ResultWitActions<T = boolean> = {
	result: T;
	actions: Action[];
};

export interface ObjectWithId {
	id: Id;
}

export type Task = (...params: unknown[]) => unknown;

export type Size = {
	width: number;
	height: number;
};
