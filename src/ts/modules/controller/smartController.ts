import { HEIGHT, WIDTH } from '../../utils/constants';
import { ArenaType, ControlInput, Direction, Input, MoveInput, Player, PlayerMode } from '../../utils/enums';
import { UserSettings } from '../../utils/types';
import { Arena } from '../arena/arena';
import { Observer } from '../observable/observer';
import { Presenter } from '../presenter/presenter';
import { NormalStrategy } from '../arena/strategies/instances/normalStrategy';
import { SoftWallsStrategy } from '../arena/strategies/instances/softWallsStrategy';
import { TransparentWallsStrategy } from '../arena/strategies/instances/transparentWallsStrategy';
import { ArenaStrategy } from '../arena/strategies/arenaStrategy';

const { Up, Down, Left, Right } = Direction;
const { P1, P2 } = Player;

const inputToSnakeIdDirection = {
	[MoveInput.RUp]: { snakeId: P1, direction: Up },
	[MoveInput.RDown]: { snakeId: P1, direction: Down },
	[MoveInput.RLeft]: { snakeId: P1, direction: Left },
	[MoveInput.RRight]: { snakeId: P1, direction: Right },
	[MoveInput.LUp]: { snakeId: P2, direction: Up },
	[MoveInput.LDown]: { snakeId: P2, direction: Down },
	[MoveInput.LLeft]: { snakeId: P2, direction: Left },
	[MoveInput.LRight]: { snakeId: P2, direction: Right }
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

export type ControllerOptions = {
	presenter: Presenter;
	width?: number;
	height?: number;
	autostart?: boolean;
	onStart: () => void;
	onFinish: () => void;
};

const defaultOptions = {
	width: WIDTH,
	height: HEIGHT,
	autostart: false
};
export class SmartController implements Observer {
	private arena!: Arena;
	private presenter: Presenter;
	private width: number;
	private height: number;
	private onStart: () => void;
	private onFinish: () => void;

	constructor(options: ControllerOptions) {
		const cOptions = { ...defaultOptions, ...options };
		const { autostart } = cOptions;

		({
			presenter: this.presenter,
			width: this.width,
			height: this.height,
			onStart: this.onStart,
			onFinish: this.onFinish
		} = cOptions);

		this.presenter.onInput((input: Input) => {
			if (MoveInput[input]) {
				this.handleMoveInput(input as MoveInput);
			}

			if (ControlInput[input]) {
				this.handleControlInput(input as ControlInput);
			}
		});

		autostart && this.start();
	}

	notify(): void {
		const state = this.arena.getState();
		const { inProgress } = state;

		this.presenter.render(state);

		if (!inProgress) {
			return this.onFinish();
		}

		this.arena.move();
	}

	private start = () => {
		const { playerMode, arenaType } = this.getUserSettings();
		const directions = playerModeToDirections[playerMode];

		this.presenter.reset();
		const arenaStrategy = new arenaStrategies[arenaType](this.width, this.height) as ArenaStrategy;
		this.arena = new Arena(directions, arenaStrategy, this.width, this.height);
		this.onStart();
	};

	private handleMoveInput = (input: MoveInput) => {
		const { snakeId, direction } = inputToSnakeIdDirection[input];
		this.arena.sendDirection(snakeId, direction);
	};

	private handleControlInput = (input: ControlInput) => {
		switch (input) {
			case ControlInput.Start:
				this.start();
				break;
			default:
				break;
		}
	};

	private getUserSettings = (): UserSettings => this.presenter.getUserSettings();
}
