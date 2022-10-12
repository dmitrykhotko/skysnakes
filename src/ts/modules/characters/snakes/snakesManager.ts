import { SNAKE_LENGTH } from '../../../utils/constants';
import { Direction, Player } from '../../../utils/enums';
import { Hlp, SnakesUtils } from '../../../utils';
import { PointWithId, Point, DirectionWithId } from '../../../utils/types';
import { Action, BinActions, SnakesActions, state } from '../../redux';
import { SnakeState } from '../../redux/reducers/instances/snakesReducer';

export abstract class SnakesManager {
	private static directionWeights = {
		[Direction.Up]: -1,
		[Direction.Down]: 1,
		[Direction.Left]: -2,
		[Direction.Right]: 2
	};

	static initSnakes = (snakesInitial: DirectionWithId[], width: number, height: number): void => {
		snakesInitial.forEach(({ id, direction }) => {
			this.initSnake(id, direction, this.getStartPoint(direction, width, height));
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

			const nextHead = Hlp.nextPoint(head, direction);

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
				if (Hlp.comparePoints(object, point)) {
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

	static removeSnakes = (ids: Player[]): void => {
		const bin = [] as Point[];
		const actions = [] as Action[];

		for (let i = 0; i < ids.length; i++) {
			const id = ids[i];
			const snake = SnakesUtils.getById(id);

			let point: Point | undefined = snake.head;

			while (point) {
				bin.push(point);
				point = point.prev;
			}

			actions.push(SnakesActions.removeSnake(id));
		}

		state.dispatch(...actions, BinActions.moveToBin(bin));
	};

	private static initSnake = (id: Player, direction: Direction, head: Point): void => {
		const tail = this.initSnakeBody(head, SNAKE_LENGTH, direction);
		state.dispatch(SnakesActions.setSnake({ id, head, tail, direction }));
	};

	private static initSnakeBody = (head: Point, length: number, direction: Direction): Point => {
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

	private static applyDirection = (data: SnakeState): Direction => {
		const { id, direction, newDirection } = data;

		if (!(newDirection && this.directionWeights[direction] + this.directionWeights[newDirection])) {
			return direction;
		}

		state.dispatch(SnakesActions.newDirection(undefined, id));

		return newDirection;
	};

	private static getStartPoint = (direction: Direction, width: number, height: number): Point => {
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
}
