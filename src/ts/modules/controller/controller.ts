import { Observer } from '../observable/observer';
import { Renderer } from '../renderers/renderer';
import { Direction, Snake } from '../snake/snake';

export class Controller implements Observer {
	constructor(
		private snake: Snake,
		private renderer: Renderer,
		private onFinish: () => void
	) {
		this.renderer.onInput((input: Direction) => this.snake.setDirection(input));
	}

	notify(): void {
		const state = this.snake.getState();

		this.renderer.render(state);

		if (!state.inProgress) {
			this.onFinish();
		}

		this.snake.move();
	}
}
