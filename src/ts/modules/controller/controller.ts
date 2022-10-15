import { GAME_PAUSE, GAME_START, SET_INPUT } from '../../utils/constants';
import { ControlInput, FireInput, GameStatus, MoveInput, ServiceInput } from '../../utils/enums';
import {
	ArenaStore,
	BulletsStore,
	InputStore,
	SettingsStore,
	SnakesActions,
	SnakesStore,
	state,
	Store,
	BinStore,
	CommonActions,
	StatStore,
	ArenaActions,
	Action
} from '../redux';
import { Arena } from '../arena/arena';
import { Observer } from '../observable/observer';
import { Renderer } from '../renderers/renderer';
import {
	fireInputToPlayerId,
	arenaStrategies,
	ControllerProps,
	defaultProps,
	inputToIdDirection,
	toDirectionsAndPlayers
} from './utils';
import { GameState } from '../../utils/types';
import { NormalStrategy } from '../arena/strategies';
import { Hlp } from '../../utils';
import { Snakes } from '../arena/characters/snakes';
import { Bullets } from '../arena/characters/bullets';
import { Stat } from '../stat/stat';

export class Controller {
	private arena!: Arena;
	private renderer: Renderer;
	private width: number;
	private height: number;
	private onStart: () => void;
	private onFinish: () => void;

	constructor(props: ControllerProps) {
		const cProps = { ...defaultProps, ...props };
		const { autostart } = cProps;

		({
			renderer: this.renderer,
			width: this.width,
			height: this.height,
			onStart: this.onStart,
			onFinish: this.onFinish
		} = cProps);

		this.arena = new Arena({ width: this.width, height: this.height });
		this.subscribe();

		autostart && this.start();
	}

	notify(): void {
		this.arena.step();

		const arenaState = this.getArenaData();
		this.renderer.render(arenaState);

		if (arenaState.gameStatus !== GameStatus.InProgress) {
			return this.onFinish();
		}
	}

	private subscribe = (): void => {
		state.subscribe(this.handleInput as Observer, SET_INPUT);
		state.subscribe(this.handleControlInput as Observer, GAME_START);
		state.subscribe(this.handleControlInput as Observer, GAME_PAUSE);
	};

	private getArenaData = (): GameState => {
		const { arena, snakes, bullets, bin, stat } = state.get<
			ArenaStore & SnakesStore & BulletsStore & BinStore & StatStore
		>();

		return {
			snakes,
			bullets,
			bin,
			...arena,
			...stat
		} as GameState;
	};

	private start = (): void => {
		const { playerMode, arenaType, lives } = state.get<SettingsStore>().settings;
		const snakesInitial = toDirectionsAndPlayers[playerMode];

		state.dispatch(CommonActions.resetGame());
		state.dispatch(
			...Stat.reset(
				snakesInitial.map(({ id }) => id),
				lives
			)
		);

		this.arena.start(snakesInitial, new arenaStrategies[arenaType](), new NormalStrategy());
		this.renderer.focus();

		this.onStart();
	};

	private pauseContinue = (): void => {
		const { gameStatus } = state.get<ArenaStore>().arena;
		let action: Action | undefined;

		switch (gameStatus) {
			case GameStatus.InProgress:
				action = ArenaActions.setGameStatus(GameStatus.Pause);
				this.onFinish();
				break;
			case GameStatus.Pause:
				action = ArenaActions.setGameStatus(GameStatus.InProgress);
				this.onStart();
				break;
			default:
				break;
		}

		action && state.dispatch(action);
		this.renderer.focus();
	};

	private handleInput = (store: InputStore): void => {
		const { playerInput: input } = store.input;
		const { gameStatus } = state.get<ArenaStore>().arena;

		ServiceInput[input] && this.pauseContinue();

		if (gameStatus !== GameStatus.InProgress) {
			return;
		}

		MoveInput[input] && this.handleDirectionChange(store);
		FireInput[input] && this.handleFire(store);
	};

	private handleControlInput = (store: InputStore): void => {
		switch (store.input.controlInput) {
			case ControlInput.Start:
				this.start();
				break;
			case ControlInput.Pause:
				this.pauseContinue();
				break;
			default:
				break;
		}
	};

	private handleDirectionChange = (store: Store): void => {
		const { playerInput } = (store as InputStore).input;
		const { id, direction } = inputToIdDirection[playerInput as MoveInput];
		const snake = Snakes.getById(id);

		snake && state.dispatch(SnakesActions.newDirection(direction, id));
	};

	private handleFire = (store: Store): void => {
		const { playerInput } = (store as InputStore).input;
		const id = fireInputToPlayerId[playerInput as FireInput];
		const snake = Snakes.getById(id);

		if (!snake) {
			return;
		}

		const { head, direction } = snake;
		Bullets.create(id, Hlp.nextPoint(head, direction), direction);
	};
}
