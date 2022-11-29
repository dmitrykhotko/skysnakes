import { Controller } from '../controller/controller';
import './express';
import { WaitingRoom } from './waitingRoom';
import { WSS } from './wSS';

const createGameInstance = ({ players, room: { lives } }: WaitingRoom): void => {
	new Controller(players, lives);
};

new WSS(createGameInstance);
