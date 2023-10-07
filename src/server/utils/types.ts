import { WebSocket } from 'ws';
import { Direction } from '../../common/enums';
import { Id, LinkedPoint, ObjectWithId, Size } from '../../common/types';
import { Action } from '../redux/actions';

export interface SnakeData extends ObjectWithId {
    serviceId: Id;
    head: LinkedPoint;
    tail: LinkedPoint;
    direction: Direction;
}

export interface DirectionWithId extends ObjectWithId {
    direction: Direction;
}

export interface ResultWitActions<T = boolean> {
    result: T;
    actions: Action[];
}

export interface WSWithId extends ObjectWithId {
    wS: WebSocket;
}

export interface InitialData {
    players: DirectionWithId[];
    size: Size;
    lives: number;
}
