import { SnakesStore, SnakeState, state } from '../../modules/redux';
import { Player } from '../enums';

export abstract class SnakesUtils {
	static get = (): SnakeState[] => state.get<SnakesStore>().snakes;

	static getById = (id: Player, state?: SnakesStore): SnakeState => {
		const snakes = state?.snakes || this.get();
		let targetSnake!: SnakeState;

		for (let i = 0; i < snakes.length; i++) {
			const snake = snakes[i];

			if (snake.id === id) {
				targetSnake = snake;
				break;
			}
		}

		return targetSnake;
	};
}
