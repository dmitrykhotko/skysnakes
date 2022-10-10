import { Action } from '../modules/redux';
import { Strategy, PlayerMode, DrawGrid, Direction, MoveInput, FireInput, Player } from './enums';

export type GameState = {
	inProgress: boolean;
	coin: Point;
	snakes: SnakeData[];
	bullets: Bullet[];
	score: WeightedScore[];
	loosers: Player[];
	bin: Point[];
};

export type Point = {
	x: number;
	y: number;
	next?: Point;
	prev?: Point;
};

export type UserSettings = {
	playerMode: PlayerMode;
	arenaType: Strategy;
	drawGrid: DrawGrid;
	deathsNum: number;
};

export type SnakeData = {
	id: Player;
	head: Point;
	tail: Point;
	direction: Direction;
};

export type PlayersStat = {
	id: Id;
	deaths: number;
	score: number;
};

export type WeightedScore = {
	deaths: number;
	score: number;
	id: Player;
};

export type Bullet = {
	id: Id;
	playerId: Player;
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
