import { NEW_DIRECTION, SNAKE_LENGTH } from '../../../utils/constants';
import { Direction, Player } from '../../../utils/enums';
import { comparePoints, nextPointCreator } from '../../../utils/helpers';
import { PointWithId, Point } from '../../../utils/types';
import { Action, BinActions, SnakesActions, SnakesStore, state } from '../../redux';
import { SnakeState } from '../../redux/reducers/instances/snakes';

const directionWeights = {
	[Direction.Up]: -1,
	[Direction.Down]: 1,
	[Direction.Left]: -2,
	[Direction.Right]: 2
};

const initSnakeBody = (head: Point, length: number, direction: Direction): Point => {
	const D = Direction;
	const xStep = direction === D.Left ? 1 : direction === D.Right ? -1 : 0;
	const yStep = direction === D.Up ? 1 : direction === D.Down ? -1 : 0;

	let point: Point = { x: head.x + xStep, y: head.y + yStep };

	head.prev = point;
	point.next = head;

	for (let i = 0; i < length - 2; i++) {
		const newPoint: Point = { x: point.x + xStep, y: point.y + yStep };

		point.prev = newPoint;
		newPoint.next = point;
		point = newPoint;
	}

	const tail = point;

	return tail;
};

const initSnake = (snakeInitial: { id: Player; head: Point; direction: Direction }): void => {
	const { id, head, direction } = snakeInitial;
	const tail = initSnakeBody(head, SNAKE_LENGTH, direction);

	state.dispatch(SnakesActions.setSnake({ id, head, tail, direction }));
};

export abstract class SnakesManager {
	static move = (shouldMoveTail: (id: Player, head: Point) => boolean): void => {
		const snakes = Object.values(state.get<SnakesStore>().snakes);

		for (let i = 0; i < snakes.length; i++) {
			const snake = snakes[i];
			const { id } = snakes[i];
			const actions = [] as Action[];
			let { head, tail, direction } = snake;

			direction = this.applyDirection(snake);

			const nextHead = nextPointCreator[direction](head);

			nextHead.prev = head;
			head.next = nextHead;
			head = nextHead;

			if (shouldMoveTail(id, head)) {
				actions.push(BinActions.moveToBin([tail]));

				tail.next && (tail = tail.next);
				tail.prev = undefined;
			}

			state.dispatch(SnakesActions.setSnake({ id, head, tail, direction }), ...actions);
		}
	};

	static faceObject = (object: Point, skipHead = true): PointWithId | undefined => {
		const snakes = Object.values(state.get<SnakesStore>().snakes);

		for (let i = 0; i < snakes.length; i++) {
			const { id, head } = snakes[i];
			let point = skipHead ? head.prev : head;

			while (point) {
				if (comparePoints(object, point)) {
					break;
				}

				point = point.prev;
			}

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

		snake1 && initSnake(snake1);
		snake2 && initSnake(snake2);
	};

	private static applyDirection = (data: SnakeState): Direction => {
		const { id, direction, newDirection } = data;

		if (!(newDirection && directionWeights[direction] + directionWeights[newDirection])) {
			return direction;
		}

		state.dispatch(SnakesActions.newDirection(undefined, id));

		return newDirection;
	};
}
