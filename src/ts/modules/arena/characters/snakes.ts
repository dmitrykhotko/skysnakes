import { SNAKE_LENGTH } from '../../../utils/constants';
import { Direction, Player } from '../../../utils/enums';
import { Hlp } from '../../../utils';
import { PointWithId, Point, DirectionWithId, ResultWitActions } from '../../../utils/types';
import { Action, BinActions, SnakesActions, state } from '../../redux';
import { SnakesStore, SnakeState } from '../../redux/reducers/instances/snakesReducer';

export abstract class Snakes {
	private static directionWeights = {
		[Direction.Up]: -1,
		[Direction.Down]: 1,
		[Direction.Left]: -2,
		[Direction.Right]: 2
	};

	static get = (): SnakeState[] => state.get<SnakesStore>().snakes;

	static getById = (id: Player): SnakeState => Hlp.getById(id, this.get());

	static init = (snakesInitial: DirectionWithId[], width: number, height: number): void => {
		snakesInitial.forEach(({ id, direction }) => {
			this.create(id, direction, this.getStartPoint(direction, width, height));
		});
	};

	static move = (middleware: (id: Player, head: Point) => boolean): void => {
		const snakes = this.get();

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

			if (middleware(id, head)) {
				actions.push(BinActions.moveToBin([tail]));

				tail.next && (tail = tail.next);
				tail.prev = undefined;
			}

			state.dispatch(SnakesActions.setSnake({ id, head, tail, direction }), ...actions);
		}
	};

	static faceObject = (object: Point, skipHead = true): PointWithId | undefined => {
		const snakes = this.get();

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

	static getSet = (width: number): Set<number> => {
		const set: Set<number> = new Set<number>();
		const snakes = this.get();

		for (let i = 0; i < snakes.length; i++) {
			let point: Point | undefined = snakes[i].head;

			while (point) {
				set.add(point.x + point.y * width);
				point = point.prev;
			}
		}

		return set;
	};

	static remove = (ids: Player[]): void => {
		const actions = [] as Action[];

		for (let i = 0; i < ids.length; i++) {
			const id = ids[i];
			const { head } = this.getById(id);
			const { actions: cutActions } = this.cut(id, head);

			actions.push(SnakesActions.removeSnake(id), ...cutActions);
		}

		state.dispatch(...actions);
	};

	static hit = (
		snakeShotResult: PointWithId
	): ResultWitActions<{
		damage: number;
		isDead: boolean;
		isHeadShot: boolean;
	}> => {
		const { id: victim, point: victimPoint } = snakeShotResult;
		const actions = [] as Action[];
		const isDead = !victimPoint.next;
		const isHeadShot = !!(isDead && victimPoint.prev);

		let damage = 1;

		if (isDead) {
			damage = this.snakeLen(victim);
		} else {
			const { result: cutRes, actions: cutActions } = this.cut(victim, victimPoint);

			damage = cutRes;
			actions.push(...cutActions);
		}

		return {
			result: { damage, isDead, isHeadShot },
			actions
		};
	};

	static snakeLen = (id: Player): number => {
		const { head } = this.getById(id);
		let point: Point | undefined = head;
		let len = 0;

		while (point) {
			++len && (point = point.prev);
		}

		return len;
	};

	static cut = (id: Player, startPoint: Point): ResultWitActions<number> => {
		const bin = [] as Point[];
		const actions = [] as Action[];
		const nextTail = startPoint.next;
		let trashPoint: Point | undefined = startPoint;

		while (trashPoint) {
			bin.push(trashPoint);
			trashPoint = trashPoint.prev;
		}

		if (nextTail) {
			nextTail.prev = undefined;
			actions.push(SnakesActions.setTail(nextTail, id));
		}

		actions.push(BinActions.moveToBin(bin));

		return {
			result: bin.length,
			actions
		};
	};

	private static create = (id: Player, direction: Direction, head: Point): void => {
		const tail = this.initBody(head, SNAKE_LENGTH, direction);
		state.dispatch(SnakesActions.setSnake({ id, head, tail, direction }));
	};

	private static initBody = (head: Point, length: number, direction: Direction): Point => {
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
