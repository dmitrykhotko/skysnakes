import WebSocket from 'ws';
import { FireInput, GameStatus, MoveInput, Player, ServiceInput } from '../../common/enums';
import { MessageType } from '../../common/messageType';
import { GameState, Message, PlayerInput, Size, SnakeArrayData } from '../../common/types';
import { Arena } from '../arena/arena';
import { Bullets } from '../arena/characters/bullets';
import { Snakes } from '../arena/characters/snakes';
import { ArenaStore, BinStore, BulletsStore, SnakesStore, state, StatStore } from '../redux';
import { ArenaActions, BinActions, CommonActions, SnakesActions } from '../redux/actions';
import { Timer } from '../timer/timer';
import { PLAYER_MODE } from '../utils/constants';
import { DelayedTasks } from '../utils/delayedTasks';
import { Hlp } from '../utils/hlp';
import { SnakeData, SocketWithId } from '../utils/types';
import { inputToDirection, modeToInitialData } from './utils';

export class Controller {
	private timer!: Timer;
	private arena = new Arena();
	private size?: Size;

	constructor(private players: SocketWithId[]) {
		state.resetState();

		this.initConnection();
		this.broadcast({
			type: MessageType.GET_SIZE
		});
	}

	private calculate = (): void => {
		DelayedTasks.run();
		this.arena.tick();
	};

	private getData = (): GameState => {
		const { arena, snakes, bullets, bin, stat } = state.get<
			ArenaStore & SnakesStore & BulletsStore & BinStore & StatStore
		>();

		state.dispatch(ArenaActions.flushCoinsBuffer(), BinActions.emptyBin());

		return {
			...arena,
			stat,
			snakes: this.convertSnakes(snakes),
			bullets,
			bin,
			coins: arena.coinsBuffer,
			additionalInfo: { coinsNum: arena.coins.length }
		} as GameState;
	};

	private broadcast = (msg: Message): void => {
		for (let i = 0; i < this.players.length; i++) {
			const { ws } = this.players[i];

			ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify(msg));
		}
	};

	private start = (): void => {
		this.broadcast({ type: MessageType.START });
		const initialData = modeToInitialData[PLAYER_MODE];

		DelayedTasks.reset();
		state.dispatch(CommonActions.resetGame(initialData), ArenaActions.setGameStatus(GameStatus.InProgress));

		this.arena.start(initialData);
		this.timer.start();
	};

	private initConnection = (): void => {
		this.timer = new Timer(this.tick);

		this.players.forEach(({ ws }) => {
			ws.on('message', (message: string) => {
				const { type, data } = JSON.parse(message) as Message<unknown>;

				switch (type) {
					case MessageType.SET_SIZE:
						const isSet = this.handleSetSizeMsg(data as Size);

						if (!isSet) {
							break;
						}

						this.start();

						break;
					case MessageType.USER_INPUT:
						const index = this.players.findIndex(player => player.ws === ws);

						if (!~index) {
							break;
						}

						this.handleInputMsg(data as PlayerInput, this.players[index].id);
						break;
					default:
						break;
				}
			});

			ws.on('close', () => {
				this.timer.stop();
			});
		});
	};

	private tick = (): void => {
		this.broadcast({
			type: MessageType.TICK,
			data: this.getData()
		});

		this.calculate();
	};

	private handleSetSizeMsg = (size: Size): boolean => {
		if (!this.size) {
			this.size = size;
			return false;
		}

		const width = Math.min(this.size.width, size.width);
		const height = Math.min(this.size.height, size.height);

		state.dispatch(ArenaActions.setSize({ width, height }));

		return true;
	};

	private convertSnakes = (snakes: SnakeData[]): SnakeArrayData[] => {
		const arr = [] as SnakeArrayData[];

		for (let i = 0; i < snakes.length; i++) {
			const { id, direction } = snakes[i];
			arr.push({
				id,
				direction,
				body: Snakes.toArray(id)
			});
		}

		return arr;
	};

	private handleInputMsg = (input: PlayerInput, id: Player): void => {
		const { status } = state.get<ArenaStore>().arena;

		ServiceInput[input] && this.handleServiceInput(input as ServiceInput);

		if (status !== GameStatus.InProgress) {
			return;
		}

		MoveInput[input] && this.handleMoveInput(input as MoveInput, id);
		FireInput[input] && this.handleFireInput(input as FireInput, id);
	};

	private handleServiceInput = (input: ServiceInput): void => {
		const { status } = state.get<ArenaStore>().arena;

		switch (status) {
			case GameStatus.InProgress:
				input === ServiceInput.Enter ? this.start() : this.pause();
				break;
			case GameStatus.Pause:
				state.dispatch(ArenaActions.setGameStatus(GameStatus.InProgress));
				this.timer.start();

				break;
			case GameStatus.Stop:
				this.start();
				break;
			default:
				break;
		}
	};

	private handleMoveInput = (input: MoveInput, id: Player): void => {
		const direction = inputToDirection[input];
		const snake = Snakes.getById(id);

		snake && state.dispatch(SnakesActions.newDirection(direction, id));
	};

	private handleFireInput = (input: FireInput, id: Player): void => {
		const snake = Snakes.getById(id);

		if (!snake) {
			return;
		}

		const { head, direction } = snake;
		Bullets.create(id, Hlp.nextPoint(head, direction), direction);
	};

	private pause = (): void => {
		state.dispatch(ArenaActions.setGameStatus(GameStatus.Pause));

		this.timer.stop();
		this.tick();
	};
}
