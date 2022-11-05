import WebSocket from 'ws';
import { FireInput, GameStatus, MoveInput, ServiceInput } from '../../common/enums';
import { MessageType } from '../../common/messageType';
import { GameState, Message, Observer, PlayerInput, Size, SnakeArrayData } from '../../common/types';
import { Arena } from '../arena/arena';
import { Bullets } from '../arena/characters/bullets';
import { Snakes } from '../arena/characters/snakes';
import {
	ArenaActions,
	ArenaStore,
	BinActions,
	BinStore,
	BulletsStore,
	CommonActions,
	InputActions,
	InputStore,
	SnakesActions,
	SnakesStore,
	state,
	StatStore
} from '../redux';
import { ActionType } from '../redux/actions/actionType';
import { Timer } from '../timer/timer';
import { PLAYER_MODE } from '../utils/constants';
import { DelayedTasks } from '../utils/delayedTasks';
import { Hlp } from '../utils/hlp';
import { SnakeData } from '../utils/types';
import { fireInputToPlayerId, inputToIdDirection, modeToInitialData } from './utils';

export class Controller {
	private timer!: Timer;
	private arena = new Arena();

	constructor(private ws: WebSocket) {
		state.resetState().subscribe(this.handleInput as Observer, ActionType.SET_INPUT);
		this.initConnection();
	}

	calculate = (): void => {
		DelayedTasks.run();
		this.arena.tick();
	};

	getData = (): GameState => {
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

	start = (): void => {
		this.ws.send(JSON.stringify({ type: MessageType.START }));
		const initialData = modeToInitialData[PLAYER_MODE];

		DelayedTasks.reset();
		state.dispatch(CommonActions.resetGame(initialData), ArenaActions.setGameStatus(GameStatus.InProgress));

		this.arena.start(initialData);
		this.timer.start();
	};

	private initConnection = (): void => {
		this.timer = new Timer(this.tick);
		this.ws.on('message', (message: string) => {
			const { type, data } = JSON.parse(message) as Message<unknown>;

			switch (type) {
				case MessageType.SET_SIZE:
					this.setSize(data as Size);
					break;
				case MessageType.USER_INPUT:
					state.dispatch(InputActions.setInput(data as PlayerInput));
					break;
				default:
					break;
			}
		});

		this.ws.on('close', () => {
			this.timer.stop();
		});
	};

	private tick = (): void => {
		this.ws.send(
			JSON.stringify({
				type: MessageType.TICK,
				data: this.getData()
			})
		);

		this.calculate();
	};

	private setSize = (size: Size): void => {
		state.dispatch(ArenaActions.setSize(size));
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

	private handleInput = (store: InputStore): void => {
		const { playerInput: input } = store.input;
		const { status } = state.get<ArenaStore>().arena;

		ServiceInput[input] && this.handleServiceInput(input as ServiceInput);

		if (status !== GameStatus.InProgress) {
			return;
		}

		MoveInput[input] && this.handleMoveInput(input as MoveInput);
		FireInput[input] && this.handleFireInput(input as FireInput);
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

	private handleMoveInput = (input: MoveInput): void => {
		const { id, direction } = inputToIdDirection[input];
		const snake = Snakes.getById(id);

		snake && state.dispatch(SnakesActions.newDirection(direction, id));
	};

	private handleFireInput = (input: FireInput): void => {
		const id = fireInputToPlayerId[input];
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
