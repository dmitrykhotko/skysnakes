import {
    AudioNotifType,
    CoinType,
    Direction,
    FireInput,
    GameStatus,
    MoveInput,
    Player,
    ServiceInput,
    VisualNotifType
} from './enums';
import { MessageType } from './messageType';

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

export type PlayerStatSlim = number[];

export type Point = number[];

export interface LinkedPoint extends Point {
    next?: LinkedPoint;
    prev?: LinkedPoint;
}

export interface PointWithId<T extends Point = Point> extends ObjectWithId {
    point: T;
}

export interface Notif<T extends VisualNotifType | AudioNotifType> extends ObjectWithId {
    type: T;
}

export type AudioNotif = Notif<AudioNotifType>;

export interface VisualNotif extends Notif<VisualNotifType> {
    point: Point;
    value: string;
}

export type StatState = {
    playersStat: PlayerStat[];
    winners?: Player[];
};

export type NotifsState = {
    audio?: AudioNotif[];
    visual?: VisualNotif[];
};

export interface Bullet extends PointWithId {
    player: Player;
    direction: Direction;
}

export interface Coin extends PointWithId {
    type: CoinType;
    player?: Player;
}

export type CoinSlim = number[];

export type SnakeDataSlim = number[];

export type NotifSlim = (number | string)[];

export type PointSlim = number;

export type StatStateSlim = {
    ps?: PlayerStatSlim[];
    w?: Player[];
};

export type GameState = {
    s?: GameStatus;
    c?: CoinSlim[];
    ss?: SnakeDataSlim[];
    bs?: PointSlim[];
    st?: StatStateSlim;
    n?: NotifSlim[];
    b?: PointSlim[];
    ai?: Record<string, string | number>;
};

export type Size = {
    width: number;
    height: number;
};

export type Observer<T = unknown, K = void> = (...params: T[]) => K;

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
