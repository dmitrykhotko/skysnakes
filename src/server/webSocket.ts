import { v4 } from 'node-uuid';
import WebSocket from 'ws';
import { Controller } from './controller/controller';

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

wss.on('connection', function connection(ws) {
	ws.id = v4();

	// console.log(`Client ${ws.id} Connected!`);

	// ws.send(`{"id": '${ws.id}'}`);

	const controller = new Controller(ws);

	ws.on('close', () => {
		console.log('This Connection Closed!');
		console.log(`Removing Client: ${ws.id}`);
	});

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
