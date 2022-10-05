import { ArenaType, PlayerMode, DrawGrid, Direction, MoveInput, ActionInput, Player } from './enums';

export type GameState = {
	inProgress: boolean;
	coin: Point;
	snakes: Record<Player, SnakeState>;
	bullets: Record<Id, Bullet>;
	score: Record<Player, Score>;
	loosers: Player[];
};

export type Point = {
	x: number;
	y: number;
	next?: Point;
	prev?: Point;
};

export type UserSettings = {
	playerMode: PlayerMode;
	arenaType: ArenaType;
	drawGrid: DrawGrid;
	deathsNum: number;
};

export type SnakeState = {
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
