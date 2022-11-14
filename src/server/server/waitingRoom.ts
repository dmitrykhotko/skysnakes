import { WebSocket } from 'ws';
import { Player } from '../../common/enums';
import { Room, UUId } from '../../common/types';
import { WSWithId } from '../utils/types';

export class WaitingRoom {
	private players = [] as WSWithId[];
	private freePlayers = [Player.P1, Player.P2];
	private $room: Room;

	constructor(uuid: UUId, name: string, wS: WebSocket) {
		this.$room = { uuid, name };
		this.addPlayer(wS);
	}

	get room(): Room {
		return this.$room;
	}

	get isFull(): boolean {
		return !this.freePlayers.length;
	}

	get isEmpty(): boolean {
		return !this.players.length;
	}

	addPlayer = (wS: WebSocket): boolean => {
		if (this.isFull) {
			return false;
		}

		const id = this.freePlayers.shift() as Player;
		this.players.push({ id, wS });

		wS.roomUUId = this.room.uuid;

		return true;
	};

	removePlayer = (wS: WebSocket): boolean => {
		const index = this.players.findIndex(player => player.wS === wS);

		if (!~index) {
			return false;
		}

		this.freePlayers.push(this.players[index].id);
		this.players.splice(index, 1);

		return true;
	};

	toArray = (): WSWithId[] => {
		return this.players;
	};

	toString = (): string => {
		return `{ ${this.room.name}: ${this.room.uuid} }`;
	};
}
