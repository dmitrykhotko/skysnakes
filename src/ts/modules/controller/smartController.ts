import { HEIGHT, WIDTH } from '../../utils/constants';
import { Observer } from '../observable/observer';
import { Renderer } from '../renderers/renderer';
import { Direction as D, Point, Snake, SnakeState } from '../snake/snake';

enum Position {
	Empty,
	Top,
	Left,
	Bottom,
	Right,
	TopLeft,
	TopRight,
	BottomLeft,
	BottomRight
}

const rightLeftToggler = ({ x } : Point): D => x === 0 ? D.Right : D.Left;
const upDownToggler = ({ y }: Point): D => y === 0 ? D.Down : D.Up;
const topCornerToggler = (dir: D) => ((_: Point, d: D) => d === D.Up ? dir : D.Down);
const bottomCornerToggler = (dir: D) => ((_: Point, d: D) => d === D.Down ? dir : D.Up);

const directionTogglers = {
	[Position.Top]: rightLeftToggler,
	[Position.Left]: upDownToggler,
	[Position.Bottom]: rightLeftToggler,
	[Position.Right]: upDownToggler,
	[Position.TopLeft]: topCornerToggler(D.Right),
	[Position.TopRight]: topCornerToggler(D.Left),
	[Position.BottomLeft]: bottomCornerToggler(D.Right),
	[Position.BottomRight]: bottomCornerToggler(D.Left)
};

export class SmartController implements Observer {
	constructor(
		private snake: Snake,
		private renderer: Renderer,
		private onFinish: () => void,
		private width = WIDTH,
		private height = HEIGHT,
	) {
		this.renderer.onInput((input: D) => this.snake.setDirection(input));
	}

	notify(): void {
		const state = this.snake.getState();

		this.renderer.render(state);

		if (!state.inProgress) {
			return this.onFinish();
		}

		const pos = this.getPosition(state);
		pos !== Position.Empty && this.renderer.input(directionTogglers[pos](state.head, state.direction));

		this.snake.move();
	}

	private getPosition = ({ head, direction }: SnakeState): Position => {
		const { x, y } = Snake.headCalculators[direction](head);

		let pos = Position.Empty;

		if (!!~x && !!~y && x !== this.width && y !== this.height) {
			return pos;
		}

		if (x === -1) {
			if (y === -1) {
				pos = Position.TopLeft
			} else if (y === this.height) {
				pos = Position.BottomLeft;
			} else {
				pos = Position.Left;
			}
		} else if (x === this.width) {
			if (y === -1) {
				pos = Position.TopRight
			} else if (y === this.height) {
				pos = Position.BottomRight;
			} else {
				pos = Position.Right;
			}
		} else if (y === -1) {
			pos = Position.Top;
		} else {
			pos = Position.Bottom;
		}

		return pos;
	}
}
