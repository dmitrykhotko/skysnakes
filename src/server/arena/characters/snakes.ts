import { Direction, Player } from '../../../common/enums';
import { LinkedPoint, Point, PointWithId } from '../../../common/types';
import { Action, BinActions, SnakesActions, state } from '../../redux';
import { SnakesStore, SnakeState } from '../../redux/reducers/instances/snakesReducer';
import { SNAKE_LENGTH } from '../../utils/constants';
import { Hlp } from '../../utils/hlp';
import { DirectionWithId, ResultWitActions } from '../../utils/types';

export abstract class Snakes {
	private static directionWeights = {
		[Direction.Up]: -1,
		[Direction.Down]: 1,
		[Direction.Left]: -2,
		[Direction.Right]: 2
	};

	static get = (): SnakeState[] => state.get<SnakesStore>().snakes;

	static getById = (id: Player): SnakeState => Hlp.getById(id, this.get());

	static init = (snakesInitial: DirectionWithId[]): void => {
		const { width, height } = Hlp.getSize();

		for (let i = 0; i < snakesInitial.length; i++) {
			const { id, direction } = snakesInitial[i];
			const head = this.getStartPoint(direction, width, height);
			const tail = this.initBody(head, SNAKE_LENGTH, direction);

			state.dispatch(SnakesActions.setSnake({ id, head, tail, direction, growthBuffer: 0 }));
		}
	};

	static move = (id: Player, checkGrowth: (id: Player, head: LinkedPoint) => number): void => {
		const snake = this.getById(id);
		const actions = [] as Action[];

		let { head, tail, direction, growthBuffer } = snake;

		direction = this.applyDirection(snake);

		const nextHead = Hlp.nextPoint(head, direction);

		nextHead.prev = head;
		head.next = nextHead;
		head = nextHead;

		growthBuffer += checkGrowth(id, head);

		if (growthBuffer) {
			growthBuffer--;
		} else {
			actions.push(BinActions.moveToBin([tail]));

			tail.next && (tail = tail.next);
			tail.prev = undefined;
		}

		state.dispatch(SnakesActions.setSnake({ id, head, tail, direction, growthBuffer }), ...actions);
	};

	static checkCollisions = (object: LinkedPoint): PointWithId | undefined => {
		const snakes = this.get();

		for (let i = 0; i < snakes.length; i++) {
			const { id, head } = snakes[i];
			let point: LinkedPoint | undefined = head;

			while (point) {
				if (object !== point && Hlp.comparePoints(object, point)) {
					break;
				}

				point = point.prev;
			}

			if (point) {
				return { point, id };
			}
		}
	};

	static remove = (ids: Player[]): void => {
		const actions = [] as Action[];

		for (let i = 0; i < ids.length; i++) {
			const id = ids[i];
			const { head } = this.getById(id);
			const { actions: cutActions } = this.cut({ id, point: head });

			actions.push(SnakesActions.removeSnake(id), ...cutActions);
		}

		state.dispatch(...actions);
	};

	static hit = (
		snakeShotResult: PointWithId<LinkedPoint>
	): ResultWitActions<{
		points: LinkedPoint[];
		isDead: boolean;
		isHeadShot: boolean;
	}> => {
		const { id, point } = snakeShotResult;
		const actions = [] as Action[];
		const isDead = !point.next;
		const isHeadShot = !!(isDead && point.prev);

		let points: LinkedPoint[];

		if (isDead) {
			points = this.toArray(id);
		} else {
			const { result: cutRes, actions: cutActions } = this.cut({ id, point });

			points = cutRes;
			actions.push(...cutActions);
		}

		return {
			result: { points, isDead, isHeadShot },
			actions
		};
	};

	static len = (id: Player, start = this.getById(id).head): number => {
		let point: LinkedPoint | undefined = start;
		let len = 0;

		while (point) {
			++len && (point = point.prev);
		}

		return len;
	};

	static toArray = (id: Player, start = this.getById(id).head): Point[] => {
		const points = [] as Point[];
		let point: LinkedPoint | undefined = start;

		while (point) {
			points.push({ x: point.x, y: point.y }) && (point = point.prev);
		}

		return points;
	};

	static cut = (...cutIt: PointWithId<LinkedPoint>[]): ResultWitActions<LinkedPoint[]> => {
		const bin = [] as LinkedPoint[];
		const actions = [] as Action[];

		for (let i = 0; i < cutIt.length; i++) {
			const { id, point: start } = cutIt[i];
			const nextTail = start.next;

			let point: LinkedPoint | undefined = start;

			while (point) {
				bin.push(point);
				point = point.prev;
			}

			if (nextTail) {
				nextTail.prev = undefined;
				actions.push(SnakesActions.setTail(nextTail, id));
			}

			actions.push(BinActions.moveToBin(bin));
		}

		return {
			result: bin,
			actions
		};
	};

	private static initBody = (head: LinkedPoint, length: number, direction: Direction): LinkedPoint => {
		const D = Direction;
		const xStep = direction === D.Left ? 1 : direction === D.Right ? -1 : 0;
		const yStep = direction === D.Up ? 1 : direction === D.Down ? -1 : 0;

		let point: LinkedPoint = { x: head.x + xStep, y: head.y + yStep };

		head.prev = point;
		point.next = head;

		for (let i = 0; i < length - 2; i++) {
			const newPoint: LinkedPoint = { x: point.x + xStep, y: point.y + yStep };

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

	private static getStartPoint = (direction: Direction, width: number, height: number): LinkedPoint => {
		let head: LinkedPoint;

		switch (direction) {
			case Direction.Left:
				head = { x: width, y: Hlp.randomInt(height) };
				break;
			case Direction.Down:
				head = { x: Hlp.randomInt(width), y: 0 };
				break;
			case Direction.Up:
				head = { x: Hlp.randomInt(width), y: height };
				break;
			case Direction.Right:
			default:
				head = { x: 0, y: Hlp.randomInt(height) };
				break;
		}

		return head;
	};
}
