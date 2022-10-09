import { Action } from '../modules/redux';
import { Strategy, PlayerMode, DrawGrid, Direction, MoveInput, FireInput, Player } from './enums';

export type GameState = {
	inProgress: boolean;
	coin: Point;
	snakes: Record<Player, SnakeState>;
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

export type SnakeState = {
	id: Player;
	head: Point;
	tail: Point;
	direction: Direction;
};

export type PlayersStat = {
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
	player: Player;
	point: Point;
	direction: Direction;
};

export type PlayerInput = FireInput | MoveInput;

export type Id = number;

export type PointWithId = { point: Point; id: number };

export type ResultWitActions<T = boolean> = {
	result: T;
	actions: Action[];
};
