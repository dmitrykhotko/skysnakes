import WebSocket from 'ws';
import { FireInput, GameStatus, MoveInput, Player, ServiceInput } from '../../common/enums';
import { MessageType } from '../../common/messageType';
import { GameState, Message, PlayerInput, Size, SnakeArrayData } from '../../common/types';
import { Arena } from '../arena/arena';
import { Snakes } from '../arena/characters/snakes';
import { ArenaStore, BinStore, BulletsStore, SnakesStore, StatStore } from '../redux';
import { ArenaActions, BinActions, BulletsActions, CommonActions, SnakesActions } from '../redux/actions';
import { createState, State } from '../redux/state';
import { Timer } from '../timer/timer';
import { PLAYER_MODE } from '../utils/constants';
import { DelayedTasks } from '../utils/delayedTasks';
import { Hlp } from '../utils/hlp';
import { SnakeData, SocketWithId } from '../utils/types';
import { inputToDirection, modeToInitialData } from './utils';

export class Controller {
	private state: State;
	private timer: Timer;
	private arena: Arena;
	private size?: Size;

	constructor(private players: SocketWithId[]) {
		this.state = createState();
		this.arena = new Arena(this.state);
		this.timer = new Timer(this.tick);

		this.initConnection();
		this.broadcast(MessageType.GET_SIZE);
	}

	private initConnection = (): void => {
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
				this.over();
				this.broadcast(MessageType.PLAYER_DISCONNECTED);
			});
		});
	};

	private calculate = (): void => {
		DelayedTasks.run();
		this.arena.tick();
	};

	private getData = (): GameState => {
		const { arena, snakes, bullets, bin, stat } = this.state.get<
			ArenaStore & SnakesStore & BulletsStore & BinStore & StatStore
		>();

		this.state.dispatch(ArenaActions.flushCoinsBuffer(), BinActions.emptyBin());

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

	private broadcast = (type: MessageType, data?: unknown): void => {
		for (let i = 0; i < this.players.length; i++) {
			const { ws } = this.players[i];

			ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify({ type, data }));
		}
	};

	private start = (): void => {
		const initialData = modeToInitialData[PLAYER_MODE];

		DelayedTasks.reset();

		this.broadcast(MessageType.START);
		this.state.dispatch(CommonActions.resetGame(initialData), ArenaActions.setGameStatus(GameStatus.InProgress));
		this.arena.start(initialData);
		this.timer.start();
	};

	private over = (): void => {
		this.state.dispatch(ArenaActions.setGameStatus(GameStatus.Over));
		this.timer.stop();
	};

	private pause = (): void => {
		this.state.dispatch(ArenaActions.setGameStatus(GameStatus.Pause));
		this.timer.stop();
		this.tick();
	};

	private tick = (): void => {
		this.broadcast(MessageType.TICK, this.getData());

		const { status } = this.state.get<ArenaStore>().arena;

		if (status === GameStatus.Finish) {
			return this.timer.stop();
		}

		this.calculate();
	};

	private handleSetSizeMsg = (size: Size): boolean => {
		if (!this.size) {
			this.size = size;
			return false;
		}

		const width = Math.min(this.size.width, size.width);
		const height = Math.min(this.size.height, size.height);

		this.state.dispatch(ArenaActions.setSize({ width, height }));

		return true;
	};

	private convertSnakes = (snakes: SnakeData[]): SnakeArrayData[] => {
		const arr = [] as SnakeArrayData[];

		for (let i = 0; i < snakes.length; i++) {
			const { id, direction } = snakes[i];
			arr.push({
				id,
				direction,
				body: Snakes.toArray(this.state, id)
			});
		}

		return arr;
	};

	private handleInputMsg = (input: PlayerInput, id: Player): void => {
		const { status } = this.state.get<ArenaStore>().arena;

		if (status === GameStatus.Over) {
			return;
		}

		ServiceInput[input] && this.handleServiceInput(input as ServiceInput);

		if (status === GameStatus.Pause) {
			return;
		}

		MoveInput[input] && this.handleMoveInput(input as MoveInput, id);
		FireInput[input] && this.handleFireInput(input as FireInput, id);
	};

	private handleServiceInput = (input: ServiceInput): void => {
		const { status } = this.state.get<ArenaStore>().arena;

		switch (status) {
			case GameStatus.InProgress:
				input === ServiceInput.Enter ? this.start() : this.pause();
				break;
			case GameStatus.Pause:
				this.state.dispatch(ArenaActions.setGameStatus(GameStatus.InProgress));
				this.timer.start();

				break;
			case GameStatus.Finish:
				this.start();
				break;
			default:
				break;
		}
	};

	private handleMoveInput = (input: MoveInput, id: Player): void => {
		const direction = inputToDirection[input];
		const snake = Snakes.getById(this.state, id);

		snake && this.state.dispatch(SnakesActions.newDirection(direction, id));
	};

	private handleFireInput = (input: FireInput, id: Player): void => {
		const snake = Snakes.getById(this.state, id);

		if (!snake) {
			return;
		}

		const { head, direction } = snake;

		this.state.dispatch(
			BulletsActions.setBullet({
				id: Hlp.generateId(),
				player: id,
				point: Hlp.nextPoint(head, direction),
				direction
			})
		);
	};
}
