import { Presenter } from '../presenters/presenter';
import { Direction, Snake } from '../snake/snake';

export class Controller {
	private intervalId?: NodeJS.Timer;

	constructor(
		private snake: Snake,
		private presenter: Presenter,
		private framesNumber: number
	) {
		this.presenter.onInput((input: Direction) => {
			this.snake.setDirection(input);
		})
	}

	start = (): void => {
		const interval = 1000 / this.framesNumber;

		this.presenter.setServiceInfoFlag(true);
		this.presenter.draw(this.snake.getState());
		this.intervalId = setInterval(this.frame, interval);
	}

	private frame = () => {
		const state = this.snake.getState();
		this.presenter.draw(state);

		if (!state.inProgress) {
			return clearInterval(this.intervalId);
		}

		this.snake.move();
	}
}
