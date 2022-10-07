import { Action } from '../modules/redux';
import { Strategy, PlayerMode, DrawGrid, Direction, MoveInput, ActionInput, Player } from './enums';

export type GameState = {
	inProgress: boolean;
	coin: Point;
	snakes: Record<Player, SnakeState>;
	bullets: Record<Id, Bullet>;
	score: Record<Player, Score>;
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

export type SnakeState = {
	id: Player;
	head: Point;
	tail: Point;
	direction: Direction;
};

export type Score = {
	deaths: number;
	coins: number;
};

export type Bullet = {
	id: Id;
	point: Point;
	direction: Direction;
};

export type PlayerInput = ActionInput | MoveInput;

export type Id = number;

export type PointWithId = { point: Point; id: number };

export type ResultWitActions<T = boolean> = {
	result: T;
	actions: Action[];
};
