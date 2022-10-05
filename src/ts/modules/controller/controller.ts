import { FIRE, SET_DIRECTION, SET_RESET, SET_START } from '../../utils/constants';
import { ControlInput } from '../../utils/enums';
import {
	Action,
	ArenaActions,
	ArenaStore,
	ShootingStore,
	InputActions,
	InputStore,
	SettingsStore,
	SnakesActions,
	SnakesStore,
	state,
	ShootingActions
} from '../redux';
import { Arena } from '../arena/arena';
import { Observer } from '../observable/observer';
import { Renderer } from '../renderers/renderer';
import {
	ActionInputToPlayer,
	arenaStrategies,
	ControllerProps,
	defaultProps,
	inputToIdDirection,
	playerModeToDirections
} from './utils';
import { generateId, nextPointCreator } from '../../utils/helpers';
import { GameState } from '../../utils/types';

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

		this.subscribe();
		autostart && this.start(true);
	}

	notify(): void {
		this.arena.move();

		const arenaState = this.getArenaData();

		this.renderer.render(arenaState);

		if (!arenaState.inProgress) {
			return this.onFinish();
		}
	}

	private getArenaData = (): GameState => {
		const store = state.get();
		return {
			...(store as ArenaStore).arena,
			snakes: (store as SnakesStore).snakes,
			bullets: (store as ShootingStore).shooting.bullets
		} as GameState;
	};

	private start = (reset = false, ...actions: Action[]): void => {
		const { width, height } = this;
		const { playerMode, arenaType, drawGrid, deathsNum } = (state.get() as SettingsStore).settings;
		const directions = playerModeToDirections[playerMode];
		this.renderer.reset(drawGrid);

		!this.arena && (this.arena = new Arena({ width, height }));
		this.arena.start(directions, deathsNum, reset);

		this.onStart();
		state.dispatch(ArenaActions.setStrategy(new arenaStrategies[arenaType]()), ...actions);
	};

	private reset = (): void => {
		this.start(true, InputActions.releaseControlInput());
	};

	private subscribe = (): void => {
		state.subscribe(this.handleMoveInput as Observer, SET_DIRECTION);
		state.subscribe(this.handleControlInput as Observer, SET_START);
		state.subscribe(this.handleControlInput as Observer, SET_RESET);
		state.subscribe(this.handleFire as Observer, FIRE);
	};

	private handleMoveInput = (store: InputStore): void => {
		const { id, direction } = inputToIdDirection[store.input.moveInput];
		state.dispatch(SnakesActions.sendDirection(direction, id));
	};

	private handleControlInput = (store: InputStore): void => {
		switch (store.input.controlInput) {
			case ControlInput.Start:
				this.start(false, InputActions.releaseControlInput());
				break;
			case ControlInput.Reset:
				this.reset();
				break;
			default:
				break;
		}
	};

	private handleFire = (store: ShootingStore): void => {
		const { fire } = store.shooting;

		if (!fire) {
			return;
		}

		const player = ActionInputToPlayer[fire];
		const snake = (store as unknown as SnakesStore).snakes[player];

		if (!snake) {
			return;
		}

		const { head, direction } = snake;

		state.dispatch(
			ShootingActions.setBullet({ id: generateId(), point: nextPointCreator[direction](head), direction })
		);
	};
}
