import { HEIGHT, WIDTH } from '../../utils/constants';
import { ControlInput, Direction as D, Input, MoveInput, Player } from '../../utils/enums';
import { Point } from '../../utils/types';
import { Field } from '../field/field';
import { Observer } from '../observable/observer';
import { Presenter } from '../presenter/presenter';
import { Snake } from '../snake/snake';

enum Position {
	Top,
	Left,
	Bottom,
	Right,
	TopLeft,
	TopRight,
	BottomLeft,
	BottomRight
}

const P = Position;
const faceTopBottom = ({ x } : Point): D => x === 0 ? D.Right : D.Left;
const fateLeftRight = ({ y }: Point): D => y === 0 ? D.Down : D.Up;
const faceTopCorner = (dir: D) => ((_: Point, d: D) => d === D.Up ? dir : D.Down);
const faceBottomCorner = (dir: D) => ((_: Point, d: D) => d === D.Down ? dir : D.Up);

const directionSwitchers = {
	[P.Top]: faceTopBottom,
	[P.Left]: fateLeftRight,
	[P.Bottom]: faceTopBottom,
	[P.Right]: fateLeftRight,
	[P.TopLeft]: faceTopCorner(D.Right),
	[P.TopRight]: faceTopCorner(D.Left),
	[P.BottomLeft]: faceBottomCorner(D.Right),
	[P.BottomRight]: faceBottomCorner(D.Left)
};

const inputToSnakeIdDirection = {
	[MoveInput.RUp]: { snakeId: Player.P1, direction: D.Up },
	[MoveInput.RDown]: { snakeId: Player.P1, direction: D.Down },
	[MoveInput.RLeft]: { snakeId: Player.P1, direction: D.Left },
	[MoveInput.RRight]: { snakeId: Player.P1, direction: D.Right },
	[MoveInput.LUp]: { snakeId: Player.P2, direction: D.Up },
	[MoveInput.LDown]: { snakeId: Player.P2, direction: D.Down },
	[MoveInput.LLeft]: { snakeId: Player.P2, direction: D.Left },
	[MoveInput.LRight]: { snakeId: Player.P2, direction: D.Right },
}

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
		const { snakes } = state;

		this.presenter.render(state);

		if (!this.field.inProgress) {
			return this.onFinish();
		}

		Object.values(snakes).forEach(({ id, head, direction }) => {
			const pos = this.getPosition(head, direction);
			pos !== undefined && this.field.sendDirection(id, directionSwitchers[pos](head, direction));
		})
		
		this.field.move();
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

	private start = () => {
		this.presenter.reset();
		this.field.reset();
		this.onStart();
	}

	private getPosition = (head: Point, direction: D): Position | undefined => {
		const { x, y } = Snake.headCalcs[direction](head);
		const { width, height } = this;

		let pos: Position;

		if (!!~x && !!~y && x !== width && y !== height) {
			return undefined;
		}

		if (!~x) {
			pos = !~y ? P.TopLeft : y === height ? P.BottomLeft : P.Left;
		} else if (x === width) {
			pos = !~y ? P.TopRight : y === height ? P.BottomRight : P.Right;
		} else if (!~y) {
			pos = P.Top;
		} else {
			pos = P.Bottom;
		}

		return pos;
	}
}
