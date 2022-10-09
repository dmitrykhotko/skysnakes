import { SEND_DIRECTION, SNAKE_LENGTH } from '../../../utils/constants';
import { Direction, Player } from '../../../utils/enums';
import { comparePoints, nextPointCreator } from '../../../utils/helpers';
import { Point, SnakeState } from '../../../utils/types';
import { Observer } from '../../observable/observer';
import { BinActions, SnakesActions, SnakesStore, state } from '../../redux';
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

	constructor(private player = Player.P1, head: Point, direction = Direction.Right, length = SNAKE_LENGTH) {
		const tail = this.initBody(head, length, direction);
		state.dispatch(SnakesActions.setSnake({ id: this.player, head, tail, direction }));
		this.subscribe();
	}

	get id(): Player {
		return this.player;
	}

	move = (): void => {
		let { head, tail, direction } = this.getState();

		direction = this.applyDirection(direction);

		const nextHead = nextPointCreator[direction](head);

		nextHead.prev = head;
		head.next = nextHead;
		head = nextHead;

		this.prevTail = tail;
		tail.next && (tail = tail.next);
		tail.prev = undefined;

		state.dispatch(
			SnakesActions.setSnake({ id: this.player, head, tail, direction }),
			BinActions.moveToBin([this.prevTail])
		);
	};

	grow = (): void => {
		if (!this.prevTail) {
			return;
		}

		let { tail } = this.getState();

		this.prevTail.next = tail;
		tail.prev = this.prevTail;
		tail = this.prevTail;

		this.prevTail = undefined;

		state.dispatch(SnakesActions.setTail(tail, this.player));
	};

	faceObject = (object: Point, skipHead = true): Point | undefined => {
		const { head } = this.getState();

		let point: Point | undefined;

		point = skipHead ? head.prev : head;

		while (point) {
			if (comparePoints(object, point)) {
				break;
			}

			point = point.prev;
		}

		return point;
	};

	private getState = (): SnakeState => state.get<SnakesStore>().snakes[this.player];

	private sendDirection = (newDirection: Direction): void => {
		const { direction } = this.getState();

		if (!(directionWeights[direction] + directionWeights[newDirection])) {
			return;
		}

		this.nextDirection = newDirection;
	};

	private subscribe = (): void => {
		state.subscribe(this.onSendDirection as Observer, SEND_DIRECTION);
	};

	private onSendDirection = (state: SnakesStore): void => {
		state.snakes[this.player] && this.sendDirection(state.snakes[this.player].newDirection);
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
