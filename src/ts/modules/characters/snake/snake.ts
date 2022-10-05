import { SEND_DIRECTION, SNAKE_LENGTH } from '../../../utils/constants';
import { Direction, Player } from '../../../utils/enums';
import { nextPoint } from '../../../utils/helpers';
import { Point, SnakeState } from '../../../utils/types';
import { Observer } from '../../observable/observer';
import { SnakesActions, SnakesStore, state } from '../../redux';
import { Character } from '../character';

const directionWeights = {
	[Direction.Up]: -1,
	[Direction.Down]: 1,
	[Direction.Left]: -2,
	[Direction.Right]: 2
};

export class Snake implements Character {
	private prevTail?: Point;
	private nextDirection?: Direction;

	constructor(private snakeId = Player.P1, head: Point, direction = Direction.Right, length = SNAKE_LENGTH) {
		const tail = this.initBody(head, length, direction);
		state.dispatch(SnakesActions.setSnake({ head, tail, direction }, this.snakeId));
		this.subscribe();
	}

	get id(): Player {
		return this.snakeId;
	}

	move = (): void => {
		let { head, tail, direction } = this.getData();

		direction = this.applyDirection(direction);

		const nextHead = nextPoint[direction](head);

		nextHead.prev = head;
		head.next = nextHead;
		head = nextHead;

		this.prevTail = tail;
		tail.next && (tail = tail.next);
		tail.prev = undefined;

		state.dispatch(SnakesActions.setSnake({ head, tail, direction }, this.snakeId));
	};

	grow = (): void => {
		if (!this.prevTail) {
			return;
		}

		let { tail } = this.getData();

		this.prevTail.next = tail;
		tail.prev = this.prevTail;
		tail = this.prevTail;

		this.prevTail = undefined;

		state.dispatch(SnakesActions.setTail(tail, this.snakeId));
	};

	private getData = (): SnakeState => (state.get() as SnakesStore).snakes[this.snakeId];

	private sendDirection = (newDirection: Direction): void => {
		const { direction } = this.getData();

		if (!(directionWeights[direction] + directionWeights[newDirection])) {
			return;
		}

		this.nextDirection = newDirection;
	};

	private subscribe = (): void => {
		state.subscribe(this.onSendDirection as Observer, SEND_DIRECTION);
	};

	private onSendDirection = (state: SnakesStore): void => {
		state.snakes[this.snakeId] && this.sendDirection(state.snakes[this.snakeId].newDirection);
	};

	private applyDirection = (direction: Direction): Direction => {
		if (!this.nextDirection) {
			return direction;
		}

		const nextDirection = this.nextDirection;
		this.nextDirection = undefined;

		return nextDirection;
	};

	private initBody = (head: Point, length: number, direction: Direction): Point => {
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
}