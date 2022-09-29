import { SEND_DIRECTION, SNAKE_LENGTH } from '../../utils/constants';
import { Direction, Player } from '../../utils/enums';
import { Point } from '../../utils/types';
import { Observer } from '../observable/observer';
import { SnakesActions, SnakesStore, state } from '../redux';

const directionWeights = {
	[Direction.Up]: -1,
	[Direction.Down]: 1,
	[Direction.Left]: -2,
	[Direction.Right]: 2
};
export class Snake {
	public static headCalcs = {
		[Direction.Up]: (point: Point): Point => ({ x: point.x, y: point.y - 1 }),
		[Direction.Down]: (point: Point): Point => ({ x: point.x, y: point.y + 1 }),
		[Direction.Left]: (point: Point): Point => ({ x: point.x - 1, y: point.y }),
		[Direction.Right]: (point: Point): Point => ({ x: point.x + 1, y: point.y })
	};

	private tail: Point;
	private prevTail?: Point;
	private nextDirection?: Direction;

	constructor(
		private id = Player.P1,
		private head: Point,
		private direction = Direction.Right,
		length = SNAKE_LENGTH
	) {
		this.tail = this.initBody(length);
	}

	get snakeHead(): Point {
		return this.head;
	}

	set snakeHead(head: Point) {
		this.head = head;
	}

	get snakeId(): Player {
		return this.id;
	}

	move = (): Point => {
		this.applyDirection();

		const nextHead = Snake.headCalcs[this.direction](this.head);

		nextHead.prev = this.head;
		this.head.next = nextHead;
		this.head = nextHead;

		this.prevTail = this.tail;
		this.tail.next && (this.tail = this.tail.next);
		this.tail.prev = undefined;

		state.dispatch(SnakesActions.setSnake({ head: this.head, tail: this.tail }, this.snakeId));

		return this.head;
	};

	grow = (): void => {
		if (!this.prevTail) {
			return;
		}

		this.prevTail.next = this.tail;
		this.tail.prev = this.prevTail;
		this.tail = this.prevTail;

		this.prevTail = undefined;

		state.dispatch(SnakesActions.setTail(this.tail, this.snakeId));
	};

	sendDirection = (newDirection: Direction): void => {
		if (!(directionWeights[this.direction] + directionWeights[newDirection])) {
			return;
		}

		this.nextDirection = newDirection;
	};

	private subscribe = () => {
		state.subscribe(this.sendDirection as Observer, SEND_DIRECTION);
	};

	private onSendDirection = (state: SnakesStore) => {
		state.snakes[this.id] && this.sendDirection(state.snakes[this.id].newDirection);
	};

	private applyDirection = () => {
		if (this.nextDirection !== undefined && !!~this.nextDirection) {
			this.direction = this.nextDirection;
			this.nextDirection = undefined;
		}
	};

	private initBody = (length: number): Point => {
		const D = Direction;
		const xStep = this.direction === D.Left ? 1 : this.direction === D.Right ? -1 : 0;
		const yStep = this.direction === D.Up ? 1 : this.direction === D.Down ? -1 : 0;

		let point: Point = { x: this.head.x + xStep, y: this.head.y + yStep };

		this.head.prev = point;
		point.next = this.head;

		for (let i = 0; i < length - 2; i++) {
			const newPoint: Point = { x: point.x + xStep, y: point.y + yStep };

			point.prev = newPoint;
			newPoint.next = point;
			point = newPoint;
		}

		const tail = point;

		return tail;
	};
}
