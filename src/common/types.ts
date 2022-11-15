import { CoinType, Direction, FireInput, GameStatus, MoveInput, NotifType, Player, ServiceInput } from './enums';

export type Id = number;
export type UUId = string;

export type PlayerInput = FireInput | MoveInput | ServiceInput;

export interface ObjectWithId {
	id: Id;
}
export interface PlayerStat extends ObjectWithId {
	lives: number;
	score: number;
}

export interface Point {
	x: number;
	y: number;
}
export interface LinkedPoint extends Point {
	next?: LinkedPoint;
	prev?: LinkedPoint;
}
export interface Notification extends ObjectWithId {
	type: NotifType;
	value: string;
	point: LinkedPoint;
}

export type StatState = {
	playersStat: PlayerStat[];
	winners: Player[];
	notifications: Notification[];
};

export interface SnakeArrayData extends ObjectWithId {
	body: Point[];
	direction: Direction;
}

export interface Bullet extends ObjectWithId {
	player: Player;
	point: Point;
	direction: Direction;
}

export interface PointWithId<T extends Point = Point> extends ObjectWithId {
	point: T;
}

export interface Coin extends PointWithId {
	type: CoinType;
	player?: Player;
}

export type GameState = {
	status: GameStatus;
	coins: Coin[];
	snakes: SnakeArrayData[];
	bullets: Bullet[];
	stat: StatState;
	bin: Point[];
	additionalInfo?: Record<string, string | number>;
};

export type Size = {
	width: number;
	height: number;
};

export type Observer = (...params: unknown[]) => void;

export interface Message<T = unknown> {
	type: string;
	data?: T;
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
