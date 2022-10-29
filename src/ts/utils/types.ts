import { Action, StatState } from '../modules/redux';
import { Direction, MoveInput, FireInput, Player, GameStatus, ServiceInput, CoinType, NotifType } from './enums';

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

export type PlayerStat = {
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

export type PlayerInput = FireInput | MoveInput | ServiceInput;

export type PointWithId = { point: Point; id: Id };

export type Coin = PointWithId & {
	type: CoinType;
	player?: Player;
};

export type Notification = {
	id: Id;
	type: NotifType;
	value: string;
	point: Point;
};

export type GameState = {
	gameStatus: GameStatus;
	coins: Coin[];
	snakes: SnakeData[];
	bullets: Bullet[];
	stat: StatState;
	bin: Point[];
	additionalInfo?: Record<string, string | number>;
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
