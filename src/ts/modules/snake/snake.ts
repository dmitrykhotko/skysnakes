import { SNAKE_LENGTH } from "../../utils/constants";
import { Direction, Player } from "../../utils/enums";
import { Point } from "../../utils/types";

export type SnakeState = {
	id: Player,
	direction: Direction,
	head: Point,
	tail: Point,
	serviceInfo: Record<string, string>
}

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

	private coin = { x: 0, y: 0 } as Point;
	private score = 0;
	private tail: Point;
	private nextDirection?: Direction;

	constructor(
		private id = Player.P1,
		private head: Point,
		private direction = Direction.Right,
		length = SNAKE_LENGTH,
	) {
		this.tail = this.initBody(length);
	}

	get snakeHead(): Point {
		return this.head;
	}

	get snakeId(): Player {
		return this.id;
	}

	moveHead = (): Point => {
		this.applyDirection();

		const nextHead = Snake.headCalcs[this.direction]((this.head));

		nextHead.prev = this.head;
		this.head.next = nextHead;
		this.head = nextHead;

		return this.head;
	};

	moveTail = (): Point => {
		this.tail.next && (this.tail = this.tail.next);
		this.tail.prev = undefined;

		return this.tail;
	}

	getState = (): SnakeState => {
		const { id, coin, head, tail, score, direction } = this;
		const serviceInfo = {
			direction: Direction[direction],
			score: score.toString(),
			coin: `x: ${coin.x}, y: ${coin.y}`,
			head: `x: ${head.x}, y: ${head.y}`,
			tail: `x: ${tail.x}, y: ${tail.y}`
		};

		return {
			id,
			direction,
			head,
			tail,
			serviceInfo
		};
	};

	sendDirection = (direction: Direction): void => {
		if (!(directionWeights[this.direction] + directionWeights[direction])) {
			return;
		}

		this.nextDirection = direction;
	};

	incScore = (): number => this.score++;

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
	}
}
