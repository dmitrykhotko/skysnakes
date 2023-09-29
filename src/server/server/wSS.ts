import { v4 } from 'uuid';
import { WebSocket, WebSocketServer } from 'ws';
import { MessageType } from '../../common/messageType';
import { Message, Observer, Room, UUId } from '../../common/types';
import { WSHlp } from '../../common/wSHlp';
import { WaitingRoom } from './waitingRoom';

declare module 'ws' {
	interface WebSocket {
		uuid: UUId;
		isAlive: boolean;
		roomUUId?: UUId;
		send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
	}
}

export class WSS {
	private port: number;
	private wSS: WebSocketServer;
	private wRooms = {} as Record<UUId, WaitingRoom>;

	constructor(private onRoomIsReady: Observer<WaitingRoom>) {
		this.port = parseInt(process.env.WSS_PORT || '8081');

		this.wSS = new WebSocketServer({ port: this.port }, () => {
			this.trace(`WS server started at :${this.port}`);
		});

		this.initConnection();
	}

	private initConnection = (): void => {
		this.wSS.on('connection', (wS: WebSocket) => {
			wS.uuid = this.uuid();

			wS.on('message', (message: string) => {
				const { t: type, d: data } = JSON.parse(message) as Message<unknown>;

				switch (type) {
					case MessageType.CREATE_ROOM:
						this.handleCreateRoomMsg(wS, data as Room);
						break;
					case MessageType.GET_AVAILABLE_ROOMS_LIST:
						this.handleGetAvailableRoomsListMsg(wS);
						break;
					case MessageType.JOIN_ROOM:
						this.handleJoinRoomMsg(wS, data as UUId);
						break;
					case MessageType.QUIT_WAITING_ROOM:
						this.handleQuitWaitingRoomMsg(wS);
						break;
					default:
						break;
				}
			});

			wS.on('close', this.handleWSCloseEvent.bind(null, wS));

			this.trace('clients num: ', this.wSS.clients.size);
		});

		this.wSS.on('listening', () => {
			this.trace(`WS listening on ${this.port}`);
		});
	};

	private handleCreateRoomMsg = (wS: WebSocket, room: Room): void => {
		this.quitWaitingRoom(wS);

		const uuid = this.uuid();
		const wRoom = new WaitingRoom({ ...room, uuid }, wS);

		this.wRooms[uuid] = wRoom;
		this.trace(`Room ${wRoom.toString()} was created. Total num = ${Object.values(this.wRooms).length}.`);

		WSHlp.send(wS, MessageType.CREATE_ROOM_SUCCESS, uuid);
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

		this.quitWaitingRoom(wS);

		wRoom.addPlayer(wS);
		WSHlp.send(wS, MessageType.JOIN_ROOM_SUCCESS, wRoom.room);

		if (wRoom.isFull) {
			const wSs = wRoom.toArray().map(({ wS }) => wS);

			WSHlp.broadcast(wSs, MessageType.ROOM_IS_READY);
			this.onRoomIsReady(wRoom);
			delete this.wRooms[uuid];
		}
	};

	private handleQuitWaitingRoomMsg = (wS: WebSocket): void => {
		this.quitWaitingRoom(wS);
	};

	private handleWSCloseEvent = (wS: WebSocket): void => {
		this.trace(`Removing client ${wS.uuid}, connection closed.`);
		this.quitWaitingRoom(wS);
	};

	private quitWaitingRoom = (wS: WebSocket): void => {
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

	private uuid = (): UUId => v4();

	private trace = (...params: unknown[]): void => {
		console.log(...params);
	};
}
