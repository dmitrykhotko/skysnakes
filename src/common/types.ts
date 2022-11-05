import { CoinType, Direction, FireInput, GameStatus, MoveInput, NotifType, Player, ServiceInput } from './enums';

export interface Point {
	x: number;
	y: number;
}

export interface LinkedPoint extends Point {
	next?: LinkedPoint;
	prev?: LinkedPoint;
}

export type SnakeArrayData = {
	id: Player;
	body: Point[];
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

export type PointWithId<T extends Point = Point> = { point: T; id: Id };

export type Coin = PointWithId & {
	type: CoinType;
	player?: Player;
};

export type Notification = {
	id: Id;
	type: NotifType;
	value: string;
	point: LinkedPoint;
};

export type StatState = {
	playersStat: PlayerStat[];
	winners: Player[];
	notifications: Notification[];
};

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

export interface Message<T> {
	type: string;
	data: T;
}
