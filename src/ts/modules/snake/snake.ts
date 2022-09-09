import { HEIGHT, SNAKE_LENGTH, WIDTH } from "../../utils/constants";

export enum Direction {
	Up,
	Down,
	Left,
	Right
}

export type Point = {
	x: number;
	y: number;
	next?: Point;
	prev?: Point;
}

export type SnakeState = {
	inProgress: boolean;
	direction: Direction;
	width: number;
	height: number;
	coin: Point;
	head: Point;
	tail: Point;
	serviceInfo?: Record<string, string>;
}

type Player = {
	head: Point,
	tail: Point,
	direction: Direction,
	score: number,
	nextDirection?: Direction
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

	private cellsNum: number;
	private coin = { x: 0, y: 0 } as Point;
	private player: Player;
	private inProgress: boolean;

	constructor(
		private width = WIDTH,
		private height = HEIGHT,
		direction = Direction.Right,
		length = SNAKE_LENGTH,
	) {
		this.cellsNum = this.width * this.height;
		this.inProgress = true;
		this.player = { ...this.makeBody(length, direction), direction, score: 0 };
		this.makeCoin();
	}

	move = (): void => {
		this.applyDirection();

		const nextHead = Snake.headCalcs[this.player.direction]((this.player.head));
		const { x, y } = nextHead;

		if (x === this.width || y === this.height || !~x || !~y || this.faceBody(nextHead)) {
			this.inProgress = false;
			return;
		}

		nextHead.prev = this.player.head;
		this.player.head.next = nextHead;
		this.player.head = nextHead;

		if (this.faceCoin()) {
			return;
		}

		this.player.tail.next && (this.player.tail = this.player.tail.next);
		this.player.tail.prev = undefined;
	};

	getState = (): SnakeState => {
		const { inProgress, width, height, coin, player: { head, tail, score, direction } } = this;
		const serviceInfo = {
			direction: Direction[direction],
			inProgress: inProgress.toString(),
			score: score.toString(),
			coin: `x: ${coin.x}, y: ${coin.y}`,
			head: `x: ${head.x}, y: ${head.y}`,
			tail: `x: ${tail.x}, y: ${tail.y}`
		};

		return {
			inProgress,
			direction,
			width,
			height,
			coin,
			head,
			tail,
			serviceInfo
		};
	};

	makeCoin = (): void => {
		const freeCells = this.getFreeCells();
		const coinCellIndex = this.getRandomInt(freeCells.length);
		const coinCellValue = freeCells[coinCellIndex];
		const x = coinCellValue % this.width;
		const y = (coinCellValue - x) / this.width;

		this.coin = { x, y };
	};

	sendDirection = (direction: Direction): void => {
		if (!(directionWeights[this.player.direction] + directionWeights[direction])) {
			return;
		}

		this.player.nextDirection = direction;
	};

	private applyDirection = () => {
		if (this.player.nextDirection !== undefined && !!~this.player.nextDirection) {
			this.player.direction = this.player.nextDirection;
			this.player.nextDirection = undefined;
		}
	};

	private getFreeCells = (): number[] => {
		const cells: number[] = [];
		const bodySet = this.getBodySet();

		for (let i = 0; i < this.cellsNum; i++) {
			if (bodySet.has(i)) {
				continue;
			}

			cells.push(i);
		}

		return cells;
	}

	private faceCoin = (): boolean => {
		if (!this.comparePoints(this.player.head, this.coin)) {
			return false;
		}

		this.player.head.next = this.coin;
		this.coin.prev = this.player.head;
		this.player.head = this.coin;

		this.player.score++;

		this.makeCoin();

		return true;
	};

	private faceBody = (newPoint: Point) => {
		let point: Point | undefined = this.player.head.prev;

		while (point) {
			if (this.comparePoints(newPoint, point)) {
				return true;
			}

			point = point.prev;
		}

		return false;
	}

	private makeBody = (length: number, direction: Direction): { head: Point, tail: Point } => {
		const head = this.getStartPoint(direction);

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

		return { head, tail };
	}

	private getBodySet = (): Set<number> => {
		const set: Set<number> = new Set<number>();
		let point: Point | undefined = this.player.head;

		while (point) {
			set.add(point.x + point.y * this.width)
			point = point.prev;
		}

		return set;
	}

	private getRandomInt = (max: number): number => Math.floor(Math.random() * max);

	private comparePoints = ({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point) => x1 === x2 && y1 === y2;

	private getStartPoint = (direction: Direction): Point => {
		let head: Point;
		switch (direction) {
			case Direction.Right:
				head = { x: 0, y: this.height / 2 };
				break;
			case Direction.Left:
				head = { x: this.width, y: this.height / 2 };
				break;
			case Direction.Down:
				head = { x: this.width / 2, y: 0 };
				break;
			case Direction.Up:
				head = { x: this.width / 2, y: this.height };
				break;
			default:
				head = { x: 0, y: this.height / 2 };
				break;
		}

		return head;
	}
}
