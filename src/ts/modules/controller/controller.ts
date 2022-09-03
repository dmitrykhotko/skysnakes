import { Renderer } from '../renderers/renderer';
import { Direction, Snake } from '../snake/snake';

export class Controller {
	private intervalId?: NodeJS.Timer;

	constructor(
		private snake: Snake,
		private renderer: Renderer,
		private framesNumber: number
	) {
		this.renderer.onInput((input: Direction) => {
			this.snake.setDirection(input);
		})
	}

	start = (): void => {
		const interval = 1000 / this.framesNumber;

		this.renderer.render(this.snake.getState());
		this.intervalId = setInterval(this.frame, interval);
	}

	private frame = () => {
		const state = this.snake.getState();
		this.renderer.render(state);

		if (!state.inProgress) {
			return clearInterval(this.intervalId);
		}

		this.snake.move();
	}
}
