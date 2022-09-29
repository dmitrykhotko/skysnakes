import { HEIGHT, SET_DIRECTION, SET_RESET, SET_START, WIDTH } from '../../utils/constants';
import { ArenaType, ControlInput, Direction, MoveInput, Player, PlayerMode } from '../../utils/enums';
import {
	Action,
	ArenaActions,
	ArenaStore,
	InputActions,
	InputStore,
	SettingsStore,
	SnakesActions,
	SnakesStore,
	state
} from '../redux';
import { Arena, ArenaState } from '../arena/arena';
import { NormalStrategy, SoftWallsStrategy, TransparentWallsStrategy } from '../arena/strategies';
import { Observer } from '../observable/observer';
import { Renderer } from '../renderers/renderer';

const { Up, Down, Left, Right } = Direction;
const { P1, P2 } = Player;

const inputToIdDirection = {
	[MoveInput.RUp]: { id: P1, direction: Up },
	[MoveInput.RDown]: { id: P1, direction: Down },
	[MoveInput.RLeft]: { id: P1, direction: Left },
	[MoveInput.RRight]: { id: P1, direction: Right },
	[MoveInput.LUp]: { id: P2, direction: Up },
	[MoveInput.LDown]: { id: P2, direction: Down },
	[MoveInput.LLeft]: { id: P2, direction: Left },
	[MoveInput.LRight]: { id: P2, direction: Right }
};

const playerModeToDirections = {
	[PlayerMode.SinglePlayer]: [Right],
	[PlayerMode.Multiplayer]: [Left, Right]
};

const arenaStrategies = {
	[ArenaType.Normal]: NormalStrategy,
	[ArenaType.Soft]: SoftWallsStrategy,
	[ArenaType.Transparent]: TransparentWallsStrategy
};

const defaultProps = {
	width: WIDTH,
	height: HEIGHT,
	autostart: false
};

export type ControllerProps = {
	renderer: Renderer;
	width?: number;
	height?: number;
	autostart?: boolean;
	onStart: () => void;
	onFinish: () => void;
};
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
		autostart && this.start();
	}

	notify(): void {
		const store = state.get();
		const arenaState = {
			...(store as ArenaStore).arena,
			snakes: (store as SnakesStore).snakes
		} as ArenaState;

		this.renderer.render(arenaState);

		if (!arenaState.inProgress) {
			return this.onFinish();
		}

		this.arena.move();
	}

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
	};

	private handleMoveInput = (newStore: InputStore): void => {
		const { id, direction } = inputToIdDirection[newStore.input.moveInput];
		state.dispatch(SnakesActions.sendDirection(direction, id));
		this.arena.sendDirection(id, direction);
	};

	private handleControlInput = (newStore: InputStore): void => {
		switch (newStore.input.controlInput) {
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
}
