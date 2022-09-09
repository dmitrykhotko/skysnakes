import { HEIGHT, WIDTH } from '../../utils/constants';
import { Observer } from '../observable/observer';
import { Renderer } from '../renderers/renderer';
import { Direction as D, Point, Snake } from '../snake/snake';

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

export class SmartController implements Observer {
	constructor(
		private snake: Snake,
		private renderer: Renderer,
		private onFinish: () => void,
		private width = WIDTH,
		private height = HEIGHT,
	) {
		this.renderer.onInput((input: D) => this.snake.sendDirection(input));
	}

	notify(): void {
		const state = this.snake.getState();
		const { head, direction, inProgress } = state;

		this.renderer.render(state);

		if (!inProgress) {
			return this.onFinish();
		}

		const pos = this.getPosition(head, direction);
		pos !== undefined && this.renderer.input(directionSwitchers[pos](head, direction));

		this.snake.move();
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
