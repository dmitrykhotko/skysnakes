import { SNAKE_LENGTH } from '../../../utils/constants';
import { Direction, Player } from '../../../utils/enums';
import { comparePoints, nextPointCreator } from '../../../utils/helpers';
import { SnakesUtils } from '../../../utils';
import { PointWithId, Point, DirectionWithId } from '../../../utils/types';
import { Action, BinActions, SnakesActions, state } from '../../redux';
import { SnakeState } from '../../redux/reducers/instances/snakes';

const directionWeights = {
	[Direction.Up]: -1,
	[Direction.Down]: 1,
	[Direction.Left]: -2,
	[Direction.Right]: 2
};

const getStartPoint = (direction: Direction, width: number, height: number): Point => {
	let head: Point;

	switch (direction) {
		case Direction.Left:
			head = { x: width, y: height / 2 };
			break;
		case Direction.Down:
			head = { x: width / 2, y: 0 };
			break;
		case Direction.Up:
			head = { x: width / 2, y: height };
			break;
		case Direction.Right:
		default:
			head = { x: 0, y: height / 2 };
			break;
	}

	return head;
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

const initSnake = (id: Player, direction: Direction, head: Point): void => {
	const tail = initSnakeBody(head, SNAKE_LENGTH, direction);
	state.dispatch(SnakesActions.setSnake({ id, head, tail, direction }));
};

export abstract class SnakesManager {
	static initSnakes = (snakesInitial: DirectionWithId[], width: number, height: number): void => {
		snakesInitial.forEach(({ id, direction }) => {
			initSnake(id, direction, getStartPoint(direction, width, height));
		});
	};

	static move = (shouldMoveTail: (id: Player, head: Point) => boolean): void => {
		const snakes = SnakesUtils.get();

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
		const snakes = SnakesUtils.get();

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

	static getSnakesSet = (width: number): Set<number> => {
		const set: Set<number> = new Set<number>();
		const snakes = SnakesUtils.get();

		for (let i = 0; i < snakes.length; i++) {
			let point: Point | undefined = snakes[i].head;

			while (point) {
				set.add(point.x + point.y * width);
				point = point.prev;
			}
		}

		return set;
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
