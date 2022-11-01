import { FOCUS_CHANGED, PLAYER_MODE, SET_INPUT } from '../utils/constants';
import { FireInput, GameStatus, MoveInput, ServiceInput } from '../utils/enums';
import {
	ArenaStore,
	BulletsStore,
	InputStore,
	SnakesActions,
	SnakesStore,
	state,
	BinStore,
	CommonActions,
	StatStore,
	ArenaActions
} from '../redux';
import { Arena } from '../arena/arena';
import { Observer } from '../utils/observable/observer';
import { Renderer } from '../renderers/renderer';
import { fireInputToPlayerId, inputToIdDirection, modeToInitialData } from './utils';
import { GameState, Size } from '../utils/types';
import { Hlp } from '../utils';
import { Snakes } from '../arena/characters/snakes';
import { Bullets } from '../arena/characters/bullets';
import { Timer } from '../timer/timer';
import { DelayedTasks } from '../utils/delayedTasks';
import { ControlsManager } from '../controlsManager/controlsManager';
import { Modal } from '../modal/modal';
import { WELCOME_MESSAGE } from '../utils/labels';

export class Controller {
	private arena = new Arena();
	private timer: Timer;
	private controls = new ControlsManager();
	private modal = new Modal();

	constructor(private renderer: Renderer, size: Size, autostart = true) {
		state
			.dispatch(ArenaActions.setSize(size))
			.subscribe(this.focusChanged as Observer, FOCUS_CHANGED)
			.subscribe(this.handleInput as Observer, SET_INPUT);

		this.timer = new Timer(this.render, this.calculate);
		autostart ? this.start() : this.modal.show(WELCOME_MESSAGE, this.start);
	}

	render = (): void => {
		const arenaState = this.getArenaData();

		this.renderer.render(arenaState);
		state.dispatch(ArenaActions.flushCoinsBuffer());

		if (arenaState.gameStatus !== GameStatus.InProgress) {
			return this.timer.stop();
		}
	};

	calculate = (): void => {
		DelayedTasks.run();
		this.arena.step();
	};

	private getArenaData = (): GameState => {
		const { arena, snakes, bullets, bin, stat } = state.get<
			ArenaStore & SnakesStore & BulletsStore & BinStore & StatStore
		>();

		return {
			...arena,
			stat,
			snakes,
			bullets,
			bin,
			coins: arena.coinsBuffer,
			additionalInfo: { coinsNum: arena.coins.length }
		} as GameState;
	};

	private start = (): void => {
		const initialData = modeToInitialData[PLAYER_MODE];

		DelayedTasks.reset();
		state.dispatch(CommonActions.resetGame(initialData));

		this.arena.start(initialData);
		this.renderer.reset();
		this.renderer.focus();
		this.timer.start();
	};

	private focusChanged = (): void => {
		this.renderer.focus();
	};

	private handleInput = (store: InputStore): void => {
		const { playerInput: input } = store.input;
		const { gameStatus } = state.get<ArenaStore>().arena;

		ServiceInput[input] && this.handleServiceInput();

		if (gameStatus !== GameStatus.InProgress) {
			return;
		}

		MoveInput[input] && this.handleMoveInput(input as MoveInput);
		FireInput[input] && this.handleFireInput(input as FireInput);
	};

	private handleServiceInput = (): void => {
		const { gameStatus } = state.get<ArenaStore>().arena;

		switch (gameStatus) {
			case GameStatus.InProgress:
				state.dispatch(ArenaActions.setGameStatus(GameStatus.Pause));
				this.timer.stop();

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

		this.renderer.focus();
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
}
