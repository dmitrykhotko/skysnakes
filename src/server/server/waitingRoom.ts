import { WebSocket } from 'ws';
import { Player } from '../../common/enums';
import { SocketWithId } from '../utils/types';

export class WaitingRoom {
	private players = [] as SocketWithId[];
	private freePlayers = [Player.P1, Player.P2];

	addPlayer = (ws: WebSocket): boolean => {
		if (this.isFull) {
			return false;
		}

		const id = this.freePlayers.shift() as Player;
		this.players.push({ id, ws });

		return true;
	};

	removePlayer = (ws: WebSocket): boolean => {
		const index = this.players.findIndex(player => player.ws === ws);

		if (!~index) {
			return false;
		}

		this.freePlayers.push(this.players[index].id);
		this.players.splice(index, 1);

		return true;
	};

	get isFull(): boolean {
		return !this.freePlayers.length;
	}

	get freePlayersNum(): number {
		return this.freePlayers.length;
	}

	toArray = (): SocketWithId[] => {
		return this.players;
	};
}
