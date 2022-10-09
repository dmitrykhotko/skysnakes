import { NEW_DIRECTION, SNAKE_LENGTH } from '../../../utils/constants';
import { Direction, Player } from '../../../utils/enums';
import { PointWithId, Point } from '../../../utils/types';
import { SnakesActions, SnakesStore, state } from '../../redux';
import { Snake } from './snake';

export type SnakeData = {
	id: Player;
	head: Point;
	direction: Direction;
};

export class Serpentarium {
	constructor(private props: SnakeData[]) {
		this.initSnakes();
	}

	move = (shouldMoveTail: (id: Player, head: Point) => boolean): void => {
		const snakes = Object.values(state.get<SnakesStore>().snakes);

		for (let i = 0; i < snakes.length; i++) {
			Snake.move(snakes[i].id, shouldMoveTail);
		}
	};

	faceObject = (object: Point, skipHead = true): PointWithId | undefined => {
		const snakes = Object.values(state.get<SnakesStore>().snakes);

		for (let i = 0; i < snakes.length; i++) {
			const { id } = snakes[i];
			const point = Snake.faceObject(id, object, skipHead);

			if (point) {
				return { point, id };
			}
		}
	};

	getBodiesSet = (width: number): Set<number> => {
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

	private initSnakes = (): void => {
		state.unsubscribeByType(NEW_DIRECTION);

		const [snake1, snake2] = this.props;

		snake1 && this.initSnake(snake1);
		snake2 && this.initSnake(snake2);
	};

	private initSnake = (data: SnakeData): void => {
		const { id, head, direction } = data;
		const tail = Snake.initBody(head, SNAKE_LENGTH, direction);

		state.dispatch(SnakesActions.setSnake({ id, head, tail, direction }));
	};
}
