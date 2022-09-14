import { HEIGHT, WIDTH } from '../../utils/constants';
import { ArenaType, ControlInput, Direction as D, Input, MoveInput, Player, PlayerMode } from '../../utils/enums';
import { UserSettings } from '../../utils/types';
import { Field } from '../field/field';
import { Observer } from '../observable/observer';
import { Presenter } from '../presenter/presenter';
import { ArenaStrategy } from './arenaStrategies/arenaStrategy';
import { NormalStrategy } from './arenaStrategies/instances/normalStrategy';
import { SoftWallsStrategy } from './arenaStrategies/instances/softWallsStrategy';

const inputToSnakeIdDirection = {
	[MoveInput.RUp]: { snakeId: Player.P1, direction: D.Up },
	[MoveInput.RDown]: { snakeId: Player.P1, direction: D.Down },
	[MoveInput.RLeft]: { snakeId: Player.P1, direction: D.Left },
	[MoveInput.RRight]: { snakeId: Player.P1, direction: D.Right },
	[MoveInput.LUp]: { snakeId: Player.P2, direction: D.Up },
	[MoveInput.LDown]: { snakeId: Player.P2, direction: D.Down },
	[MoveInput.LLeft]: { snakeId: Player.P2, direction: D.Left },
	[MoveInput.LRight]: { snakeId: Player.P2, direction: D.Right },
};

const playerModeToDirections = {
	[PlayerMode.SinglePlayer]: [D.Right],
	[PlayerMode.Multiplayer]: [D.Left, D.Right]
};

const arenaStrategies = {
	[ArenaType.Normal]: NormalStrategy,
	[ArenaType.Soft]: SoftWallsStrategy
};

export type ControllerOptions = {
	snakesDirections: D[],
	presenter: Presenter,
	width?: number,
	height?: number,
	autostart?: boolean,
	onStart: () => void,
	onFinish: () => void
}

const defaultOptions = {
	width: WIDTH,
	height: HEIGHT,
	autostart: false
}
export class SmartController implements Observer {
	private field: Field;
	private presenter: Presenter;
	private width: number;
	private height: number;
	private arenaStrategy!: ArenaStrategy;
	private onStart: () => void;
	private onFinish: () => void;

	constructor(
		options: ControllerOptions
	) {
		const cOptions = { ...defaultOptions, ...options };
		const { snakesDirections, autostart } = cOptions;

		({
			presenter: this.presenter,
			width: this.width,
			height: this.height,
			onStart: this.onStart,
			onFinish: this.onFinish,
		} = cOptions);

		this.field = new Field(snakesDirections, this.width, this.height);

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
		const state = this.field.getState();
		const { inProgress } = state;

		this.presenter.render(state);

		if (!inProgress) {
			return this.onFinish();
		}

		this.arenaStrategy.apply(this.field, state);
		this.field.move();
	}

	private start = () => {
		const { playerMode, arenaType } = this.getUserSettings();
		const directions = playerModeToDirections[playerMode];

		this.arenaStrategy = new arenaStrategies[arenaType]();
		this.presenter.reset();
		this.field = new Field(directions, this.width, this.height);
		this.onStart();
	}

	private handleMoveInput = (input: MoveInput) => {
		const { snakeId, direction } = inputToSnakeIdDirection[input];
		this.field.sendDirection(snakeId, direction);
	}

	private handleControlInput = (input: ControlInput) => {
		switch (input) {
			case ControlInput.Start:
				this.start();
				break;
			default:
				break;
		}
	}

	private getUserSettings = (): UserSettings => this.presenter.getUserSettings();
}
