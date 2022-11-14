import { Observer } from '../../common/types';
import { Controller } from '../controller/controller';
import './express';
import { WaitingRoom } from './waitingRoom';
import { WSS } from './wSS';

const createGameInstance = (room: WaitingRoom): void => {
	new Controller(room.toArray());
};

new WSS(createGameInstance as Observer);
