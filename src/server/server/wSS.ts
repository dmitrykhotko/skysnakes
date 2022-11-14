import { WebSocket, WebSocketServer } from 'ws';
import { MessageType } from '../../common/messageType';
import { Message, Observer, UUId } from '../../common/types';
import { WSHlp } from '../../common/wSHlp';
import { Hlp } from '../utils/hlp';
import { WaitingRoom } from './waitingRoom';

declare module 'ws' {
	interface WebSocket {
		uuid: UUId;
		isAlive: boolean;
		roomUUId?: UUId;
	}
}

export class WSS {
	private wSS: WebSocketServer;
	private wRooms = {} as Record<UUId, WaitingRoom>;

	constructor(private onRoomIsReady: Observer) {
		this.wSS = new WebSocketServer({ port: 8080 }, () => {
			this.trace(`WS server started at :8080`);
		});

		this.initConnection();
	}

	private initConnection = (): void => {
		this.wSS.on('connection', wS => {
			wS.uuid = Hlp.uuid();

			wS.on('message', (message: string) => {
				const { type, data } = JSON.parse(message) as Message<unknown>;

				switch (type) {
					case MessageType.CREATE_ROOM:
						this.handleCreateRoomMsg(wS, data as string);
						break;
					case MessageType.GET_AVAILABLE_ROOMS_LIST:
						this.handleGetAvailableRoomsListMsg(wS);
						break;
					case MessageType.JOIN_ROOM:
						this.handleJoinRoomMsg(wS, data as UUId);
						break;
					case MessageType.QUIT_ROOM:
						this.handleQuitRoomMsg(wS);
						break;
					default:
						break;
				}
			});

			wS.on('close', this.handleWSCloseEvent.bind(null, wS));

			this.trace('clients num: ', this.wSS.clients.size);
		});

		this.wSS.on('listening', () => {
			this.trace('WS listening on 8080');
		});
	};

	private handleCreateRoomMsg = (wS: WebSocket, name: string): void => {
		this.quitRoom(wS);

		const id = Hlp.uuid();
		const wRoom = new WaitingRoom(id, name, wS);

		this.wRooms[id] = wRoom;
		this.trace(`Room ${wRoom.toString()} was created.`);
		WSHlp.send(wS, MessageType.CREATE_ROOM_SUCCESS, id);
	};

	private handleGetAvailableRoomsListMsg = (wS: WebSocket): void => {
		const wRoomsList = Object.values(this.wRooms)
			.filter(({ room }) => room.uuid !== wS.roomUUId)
			.map(({ room }) => room);
		// const ids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(() => Hlp.uuid());

		WSHlp.send(wS, MessageType.AVAILABLE_ROOMS_LIST, wRoomsList);
		this.trace(
			`Available rooms: num = ${wRoomsList.length}, rooms = ${wRoomsList
				.map(({ uuid, name }) => `${name}: ${uuid}`)
				.join(', ')}.`
		);
	};

	private handleJoinRoomMsg = (wS: WebSocket, uuid: UUId): void => {
		const wRoom = this.wRooms[uuid];

		if (!wRoom) {
			console.log(`Room ${uuid} does not exist.`);
			return WSHlp.send(wS, MessageType.JOIN_ROOM_FAIL, uuid);
		}

		this.quitRoom(wS);

		wRoom.addPlayer(wS);
		WSHlp.send(wS, MessageType.JOIN_ROOM_SUCCESS, wRoom.room);

		if (wRoom.isFull) {
			const wSs = wRoom.toArray().map(({ wS }) => wS);

			WSHlp.broadcast(wSs, MessageType.ROOM_IS_READY);
			this.onRoomIsReady(wRoom);
			delete this.wRooms[uuid];
		}
	};

	private handleQuitRoomMsg = (wS: WebSocket): void => {
		this.quitRoom(wS);
	};

	private handleWSCloseEvent = (wS: WebSocket): void => {
		this.trace(`Removing client ${wS.uuid}, connection closed.`);
		this.quitRoom(wS);
	};

	private quitRoom = (wS: WebSocket): void => {
		const { roomUUId } = wS;

		if (!roomUUId) {
			return;
		}

		const wRoom = this.wRooms[roomUUId];

		if (!wRoom) {
			return;
		}

		wRoom.removePlayer(wS);
		wRoom.isEmpty && delete this.wRooms[roomUUId];
	};

	private trace = (...params: unknown[]): void => {
		console.log(...params);
	};
}
