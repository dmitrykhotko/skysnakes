import { v4 } from 'node-uuid';
import WebSocket from 'ws';
import { Player } from '../../common/enums';
import { Id } from '../../common/types';
import { Controller } from './../controller/controller';
import { SocketWithId } from './../utils/types';
import { WaitingRoom } from './waitingRoom';

declare module 'ws' {
	interface WebSocket {
		id: string;
		isAlive: boolean;
	}
}

const wss = new WebSocket.WebSocketServer({ port: 8080 }, () => {
	console.log('WS server started at ws://localhost:8080');
});

//Object that stores player data
// const clients = {} as Record<string, string>;

let wRoom = new WaitingRoom();

wss.on('connection', ws => {
	ws.id = v4();

	ws.on('close', () => {
		console.log('This Connection Closed!');
		console.log(`Removing Client: ${ws.id}`);

		wRoom.removePlayer(ws);
	});

	wRoom.addPlayer(ws);

	if (!wRoom.isFull) {
		return;
	}

	// console.log(`Client ${ws.id} Connected!`);

	// ws.send(`{"id": '${ws.id}'}`);

	new Controller(wRoom.toArray());
	wRoom = new WaitingRoom();

	// ws.isAlive = true;

	// ws.on('pong', () => {
	// 	ws.isAlive = true;
	// });

	console.log('clients num: ', wss.clients.size);
});

wss.on('listening', () => {
	console.log('WS listening on 8080');
});

// setInterval(() => {
// 	wss.clients.forEach((ws: WebSocket.WebSocket) => {
// 		if (!ws.isAlive) {
// 			return ws.terminate();
// 		}

// 		ws.isAlive = false;
// 		ws.ping();
// 	});
// }, 20000);
