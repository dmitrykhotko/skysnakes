import { CmHlp } from '../../../common/cmHlp';
import { Direction, Player } from '../../../common/enums';
import { LinkedPoint, Point, PointWithId } from '../../../common/types';
import { Action, BinActions, SnakesActions } from '../../redux/actions';
import { SnakesStore, SnakeState } from '../../redux/reducers/instances/snakesReducer';
import { State } from '../../redux/state';
import { SNAKE_LENGTH } from '../../utils/constants';
import { Hlp } from '../../utils/hlp';
import { DirectionWithId, ResultWitActions } from '../../utils/types';

export class Snakes {
	private static directionWeights = {
		[Direction.Up]: -1,
		[Direction.Down]: 1,
		[Direction.Left]: -2,
		[Direction.Right]: 2
	};

	constructor(private state: State) {}

	static get = (state: State): SnakeState[] => state.get<SnakesStore>().snakes;

	static getById = (state: State, id: Player): SnakeState => CmHlp.getById(id, this.get(state));

	static toArray = (state: State, id: Player, start = this.getById(state, id).head): Point[] => {
		const points = [] as Point[];
		let point: LinkedPoint | undefined = start;

		while (point) {
			const [x, y] = point;
			points.push([x, y]) && (point = point.prev);
		}

		return points;
	};

	get = (): SnakeState[] => Snakes.get(this.state);

	getById = (id: Player): SnakeState => CmHlp.getById(id, Snakes.get(this.state));

	init = (snakesInitial: DirectionWithId[]): void => {
		const { width, height } = Hlp.getSize(this.state);

		for (let i = 0; i < snakesInitial.length; i++) {
			const serviceId = Hlp.id();
			const { id, direction } = snakesInitial[i];
			const head = this.getStartPoint(direction, width, height);
			const tail = this.initBody(head, SNAKE_LENGTH, direction);

			this.state.dispatch(SnakesActions.setSnake({ id, serviceId, head, tail, direction, growthBuffer: 0 }));
		}
	};

	move = (id: Player, checkGrowth: (id: Player, head: LinkedPoint) => number): void => {
		const snake = this.getById(id);
		const actions = [] as Action[];
		const { serviceId } = snake;

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

		this.state.dispatch(SnakesActions.setSnake({ id, serviceId, head, tail, direction, growthBuffer }), ...actions);
	};

	checkCollisions = (object: LinkedPoint): PointWithId | undefined => {
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
				return { p: point, id };
			}
		}
	};

	remove = (ids: Player[]): void => {
		const actions = [] as Action[];

		for (let i = 0; i < ids.length; i++) {
			const id = ids[i];
			const { head } = this.getById(id);
			const { actions: cutActions } = this.cut({ id, p: head });

			actions.push(SnakesActions.removeSnake(id), ...cutActions);
		}

		this.state.dispatch(...actions);
	};

	hit = (
		snakeShotResult: PointWithId<LinkedPoint>
	): ResultWitActions<{
		points: LinkedPoint[];
		isDead: boolean;
		isHeadShot: boolean;
	}> => {
		const { id, p } = snakeShotResult;
		const actions = [] as Action[];
		const isDead = !p.next;
		const isHeadShot = !!(isDead && p.prev);

		let points: LinkedPoint[];

		if (isDead) {
			points = this.toArray(id);
		} else {
			const { result: cutRes, actions: cutActions } = this.cut({ id, p });

			points = cutRes;
			actions.push(...cutActions);
		}

		return {
			result: { points, isDead, isHeadShot },
			actions
		};
	};

	len = (id: Player, start = this.getById(id).head): number => {
		let point: LinkedPoint | undefined = start;
		let len = 0;

		while (point) {
			++len && (point = point.prev);
		}

		return len;
	};

	toArray = (id: Player, start = this.getById(id).head): Point[] => Snakes.toArray(this.state, id, start);

	cut = (...cutIt: PointWithId<LinkedPoint>[]): ResultWitActions<LinkedPoint[]> => {
		const bin = [] as LinkedPoint[];
		const actions = [] as Action[];

		for (let i = 0; i < cutIt.length; i++) {
			const { id, p: start } = cutIt[i];
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

	private initBody = (head: LinkedPoint, length: number, direction: Direction): LinkedPoint => {
		const D = Direction;
		const xStep = direction === D.Left ? 1 : direction === D.Right ? -1 : 0;
		const yStep = direction === D.Up ? 1 : direction === D.Down ? -1 : 0;
		const [x, y] = head;

		let point: LinkedPoint = [x + xStep, y + yStep];

		head.prev = point;
		point.next = head;

		for (let i = 0; i < length - 2; i++) {
			const [x, y] = point;
			const newPoint: LinkedPoint = [x + xStep, y + yStep];

			point.prev = newPoint;
			newPoint.next = point;
			point = newPoint;
		}

		const tail = point;
		return tail;
	};

	private applyDirection = (data: SnakeState): Direction => {
		const { id, direction, newDirection } = data;

		if (!(newDirection && Snakes.directionWeights[direction] + Snakes.directionWeights[newDirection])) {
			return direction;
		}

		this.state.dispatch(SnakesActions.newDirection(undefined, id));
		return newDirection;
	};

	private getStartPoint = (direction: Direction, width: number, height: number): LinkedPoint => {
		let head: LinkedPoint;

		switch (direction) {
			case Direction.Left:
				head = [width, Hlp.randomInt(height)];
				break;
			case Direction.Down:
				head = [Hlp.randomInt(width), 0];
				break;
			case Direction.Up:
				head = [Hlp.randomInt(width), height];
				break;
			case Direction.Right:
			default:
				head = [0, Hlp.randomInt(height)];
				break;
		}

		return head;
	};
}
