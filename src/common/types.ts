import { CoinType, Direction, FireInput, GameStatus, MoveInput, NotifType, Player, ServiceInput } from './enums';
import { MessageType } from './messageType';

export type Id = number;

export type UUId = string;

export type PlayerInput = FireInput | MoveInput | ServiceInput;

export interface ObjectWithId {
	id: Id;
}

export interface PlayerStat extends ObjectWithId {
	l: number;
	s: number;
}

export type Point = number[];

export interface LinkedPoint extends Point {
	next?: LinkedPoint;
	prev?: LinkedPoint;
}

export interface SnakeArrayData extends ObjectWithId {
	h: Point;
	p?: number;
}

export interface PointWithId<T extends Point = Point> extends ObjectWithId {
	p: T;
}

export interface Notification extends PointWithId {
	t: NotifType;
	v: string;
}

export type StatState = {
	ps: PlayerStat[];
	w?: Player[];
	n?: Notification[];
};

export interface Bullet extends PointWithId {
	pr: Player;
	d: Direction;
}

export interface Coin extends PointWithId {
	t: CoinType;
	pr?: Player;
}

export type GameState = {
	s?: GameStatus;
	c?: Coin[];
	ss?: SnakeArrayData[];
	bs?: Point[];
	st?: StatState;
	b?: Point[];
	ai?: Record<string, string | number>;
};

export type Size = {
	width: number;
	height: number;
};

export type Observer = (...params: unknown[]) => void;

export interface Message<T = unknown> {
	t: MessageType;
	d?: T;
}

export type AvailableRoom = {
	uuid: UUId;
	name: string;
};

export type Room = {
	uuid: UUId;
	name: string;
	lives: number;
};
