import { NEW_DIRECTION, SNAKE_LENGTH } from '../../../utils/constants';
import { Direction, Player } from '../../../utils/enums';
import { PointWithId, Point } from '../../../utils/types';
import { SnakesActions, SnakesStore, state } from '../../redux';
import { Snake } from './snake';

export abstract class SnakesManager {
	static move = (shouldMoveTail: (id: Player, head: Point) => boolean): void => {
		const snakes = Object.values(state.get<SnakesStore>().snakes);

		for (let i = 0; i < snakes.length; i++) {
			Snake.move(snakes[i].id, shouldMoveTail);
		}
	};

	static faceObject = (object: Point, skipHead = true): PointWithId | undefined => {
		const snakes = Object.values(state.get<SnakesStore>().snakes);

		for (let i = 0; i < snakes.length; i++) {
			const { id } = snakes[i];
			const point = Snake.faceObject(id, object, skipHead);

			if (point) {
				return { point, id };
			}
		}
	};

	static getBodiesSet = (width: number): Set<number> => {
		const set: Set<number> = new Set<number>();
		const snakes = Object.values(state.get<SnakesStore>().snakes);

		snakes.forEach(({ head }) => {
			let point: Point | undefined = head;

			while (point) {
				set.add(point.x + point.y * width);
				point = point.prev;
			}
		});

		return set;
	};

	static initSnakes = (snakesInitial: { id: Player; head: Point; direction: Direction }[]): void => {
		state.unsubscribeByType(NEW_DIRECTION);

		const [snake1, snake2] = snakesInitial;

		snake1 && this.initSnake(snake1);
		snake2 && this.initSnake(snake2);
	};

	private static initSnake = (snakeInitial: { id: Player; head: Point; direction: Direction }): void => {
		const { id, head, direction } = snakeInitial;
		const tail = Snake.initBody(head, SNAKE_LENGTH, direction);

		state.dispatch(SnakesActions.setSnake({ id, head, tail, direction }));
	};
}
