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

const headCalcs = {
	[Direction.Up]: (point: Point): Point => ({ x: point.x, y: point.y - 1 }),
	[Direction.Down]: (point: Point): Point => ({ x: point.x, y: point.y + 1 }),
	[Direction.Left]: (point: Point): Point => ({ x: point.x - 1, y: point.y }),
	[Direction.Right]: (point: Point): Point => ({ x: point.x + 1, y: point.y })
};

export class Snake {
	private prevTail?: Point;
	private nextDirection?: Direction;

	constructor(private id = Player.P1, head: Point, private direction = Direction.Right, length = SNAKE_LENGTH) {
		const tail = this.initBody(head, length);
		state.dispatch(SnakesActions.setSnake({ head, tail }, this.snakeId));
		this.subscribe();
	}

	get snakeId(): Player {
		return this.id;
	}

	move = (): Point => {
		let { head, tail } = (state.get() as SnakesStore).snakes[this.id];

		this.applyDirection();

		const nextHead = headCalcs[this.direction](head);

		nextHead.prev = head;
		head.next = nextHead;
		head = nextHead;

		this.prevTail = tail;
		tail.next && (tail = tail.next);
		tail.prev = undefined;

		state.dispatch(SnakesActions.setSnake({ head, tail }, this.snakeId));

		return head;
	};

	grow = (): void => {
		if (!this.prevTail) {
			return;
		}

		let { tail } = (state.get() as SnakesStore).snakes[this.id];

		this.prevTail.next = tail;
		tail.prev = this.prevTail;
		tail = this.prevTail;

		this.prevTail = undefined;

		state.dispatch(SnakesActions.setTail(tail, this.snakeId));
	};

	private sendDirection = (newDirection: Direction): void => {
		if (!(directionWeights[this.direction] + directionWeights[newDirection])) {
			return;
		}

		this.nextDirection = newDirection;
	};

	private subscribe = () => {
		state.subscribe(this.onSendDirection as Observer, SEND_DIRECTION);
	};

	private onSendDirection = (state: SnakesStore) => {
		state.snakes[this.id] && this.sendDirection(state.snakes[this.id].newDirection);
	};

	private applyDirection = () => {
		if (this.nextDirection === undefined || !~this.nextDirection) {
			return;
		}

		this.direction = this.nextDirection;
		this.nextDirection = undefined;
	};

	private initBody = (head: Point, length: number): Point => {
		const D = Direction;
		const xStep = this.direction === D.Left ? 1 : this.direction === D.Right ? -1 : 0;
		const yStep = this.direction === D.Up ? 1 : this.direction === D.Down ? -1 : 0;

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
}
