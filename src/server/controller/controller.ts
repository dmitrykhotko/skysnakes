import { WebSocket } from 'ws';
import { Direction, FireInput, GameStatus, MoveInput, Player, ServiceInput } from '../../common/enums';
import { MessageType } from '../../common/messageType';
import { GameState, Message, PlayerInput, Size, SnakeArrayData } from '../../common/types';
import { WSHlp } from '../../common/wSHlp';
import { Arena } from '../arena/arena';
import { Snakes } from '../arena/characters/snakes';
import { ArenaStore, BinStore, BulletsStore, SnakesStore, StatStore } from '../redux';
import { ArenaActions, BinActions, BulletsActions, CommonActions, SnakesActions } from '../redux/actions';
import { createState, State } from '../redux/state';
import { Timer } from '../timer/timer';
import { GAME_START_DELAY } from '../utils/constants';
import { DelayedTasks } from '../utils/delayedTasks';
import { Hlp } from '../utils/hlp';
import { SnakeData, WSWithId } from '../utils/types';

export class Controller {
	static inputToDirection = {
		[MoveInput.RUp]: Direction.Up,
		[MoveInput.RDown]: Direction.Down,
		[MoveInput.RLeft]: Direction.Left,
		[MoveInput.RRight]: Direction.Right
	};

	private wSs: WebSocket[];
	private state: State;
	private timer: Timer;
	private arena: Arena;
	private sizes = [] as Size[];
	private playersReady = 0;

	constructor(private players: WSWithId[], private lives: number) {
		this.state = createState();
		this.arena = new Arena(this.state);
		this.timer = new Timer(this.tick);
		this.wSs = this.players.map(({ wS }) => wS);
		// check do we ned players and wsssss arrs

		this.initConnection();
		WSHlp.broadcast(this.wSs, MessageType.GET_SIZE);
	}

	private initConnection = (): void => {
		this.players.forEach(({ wS }) => {
			wS.on('message', (message: string) => {
				const { t: type, d: data } = JSON.parse(message) as Message<unknown>;

				switch (type) {
					case MessageType.SEND_SIZE:
						const isSet = this.handleSetSizeMsg(data as Size);

						if (!isSet) {
							break;
						}

						WSHlp.broadcast(this.wSs, MessageType.SET_SIZE, Hlp.getSize(this.state));

						break;
					case MessageType.PLAYER_IS_READY:
						this.playersReady++;

						if (this.playersReady !== this.players.length) {
							return;
						}

						setTimeout(() => {
							this.start();
						}, GAME_START_DELAY);

						break;
					case MessageType.USER_INPUT:
						const index = this.players.findIndex(player => player.wS === wS);

						if (!~index) {
							break;
						}

						this.handleInputMsg(data as PlayerInput, this.players[index].id);
						break;
					default:
						break;
				}
			});

			wS.on('close', () => {
				this.over();
				WSHlp.broadcast(this.wSs, MessageType.PLAYER_DISCONNECTED);
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

		const result = {} as GameState;

		bullets.length && (result.bs = bullets);
		snakes.length && (result.ss = this.convertSnakes(snakes));
		bin.length && (result.b = bin);
		arena.coinsBuffer.length && (result.c = arena.coinsBuffer);

		return {
			s: arena.status,
			st: stat,
			// ai: { coinsNum: arena.coins.length },
			...result
		} as GameState;
	};

	private start = (): void => {
		const { lives } = this;

		const players = [
			{ direction: Direction.Right, id: Player.P1 },
			{ direction: Direction.Left, id: Player.P2 }
		];

		DelayedTasks.reset();

		this.state.dispatch(
			CommonActions.resetGame({ players, lives, size: Hlp.getSize(this.state) }),
			ArenaActions.setGameStatus(GameStatus.InProgress)
		);
		this.arena.start(players);
		this.timer.start();

		WSHlp.broadcast(this.wSs, MessageType.START);
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
		WSHlp.broadcast(this.wSs, MessageType.TICK, this.getData());

		const { status } = this.state.get<ArenaStore>().arena;

		if (status === GameStatus.Finish) {
			return this.timer.stop();
		}

		this.calculate();
	};

	private handleSetSizeMsg = (size: Size): boolean => {
		this.sizes.push(size);

		if (this.sizes.length !== this.players.length) {
			return false;
		}

		const width = Math.min(...this.sizes.map(({ width }) => width));
		const height = Math.min(...this.sizes.map(({ height }) => height));

		this.state.dispatch(ArenaActions.setSize({ width, height }));
		this.sizes = [];

		return true;
	};

	private convertSnakes = (snakes: SnakeData[]): SnakeArrayData[] => {
		const arr = [] as SnakeArrayData[];

		for (let i = 0; i < snakes.length; i++) {
			const { id, direction } = snakes[i];
			arr.push({
				id,
				d: direction,
				b: Snakes.toArray(this.state, id)
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
		const direction = Controller.inputToDirection[input];
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
				id: Hlp.id(),
				pr: id,
				p: Hlp.nextPoint(head, direction),
				d: direction
			})
		);
	};
}
