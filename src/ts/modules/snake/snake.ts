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

const directionWeights = {
	[Direction.Up]: -1,
	[Direction.Down]: 1,
	[Direction.Left]: -2,
	[Direction.Right]: 2
};

export class Snake {
	public static headCalculators = {
		[Direction.Up]: (point: Point): Point => ({ x: point.x, y: point.y - 1 }),
		[Direction.Down]: (point: Point): Point => ({ x: point.x, y: point.y + 1 }),
		[Direction.Left]: (point: Point): Point => ({ x: point.x - 1, y: point.y }),
		[Direction.Right]: (point: Point): Point => ({ x: point.x + 1, y: point.y })
	};

	private cellsNum: number;
	private coin = { x: 0, y: 0 } as Point;
	private head = { x: 0, y: 0 } as Point;
	private tail = { x: 0, y: 0 } as Point;
	private direction: Direction;
	private nextDirection?: Direction = -1;
	private inProgress: boolean;
	private score = 0;

	constructor(
		private width = WIDTH,
		private height = HEIGHT,
		length = SNAKE_LENGTH
	) {
		this.cellsNum = this.width * this.height;
		this.direction = Direction.Right;
		this.inProgress = true;

		this.makeCoin();
		this.makeBody(length);
	}

	move = (): void => {
		if (this.nextDirection !== undefined && !!~this.nextDirection) {
			this.direction = this.nextDirection;
			this.nextDirection = undefined;
		}

		const nextHead = Snake.headCalculators[this.direction]((this.head));
		const { x, y } = nextHead;

		if (x === this.width || y === this.height || !~x || !~y) {
			this.inProgress = false;
			return;
		}

		if (this.faceBody(nextHead)) {
			this.inProgress = false;
			return;
		}

		nextHead.prev = this.head;

		this.head.next = nextHead;
		this.head = nextHead;

		if (this.faceCoin()) {
			return;
		}

		this.tail.next && (this.tail = this.tail.next);
		this.tail.prev = undefined;
	};

	getState = (): SnakeState => {
		const { inProgress, width, height, coin, head, tail, direction } = this;
		const serviceInfo = {
			direction: Direction[this.direction],
			inProgress: inProgress.toString(),
			score: this.score.toString(),
			coin: `x: ${this.coin.x}, y: ${this.coin.y}`,
			head: `x: ${this.head.x}, y: ${this.head.y}`,
			tail: `x: ${this.tail.x}, y: ${this.tail.y}`
		};

		return {
			inProgress, direction, width, height, coin, head, tail, serviceInfo
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

	setDirection = (direction: Direction): void => {
		if (!(directionWeights[this.direction] + directionWeights[direction])) {
			return;
		}

		this.nextDirection = direction;
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
		if (!this.comparePoints(this.head, this.coin)) {
			return false;
		}

		this.head.next = this.coin;
		this.coin.prev = this.head;
		this.head = this.coin;

		this.score++;

		this.makeCoin();

		return true;
	};

	private faceBody = (newPoint: Point) => {
		let point: Point | undefined = this.head.prev;

		while (point) {
			if (this.comparePoints(newPoint, point)) {
				return true;
			}

			point = point.prev;
		}

		return false;
	}

	private makeBody = (length = 2) => {
		const bodyLen = length < 2 ? 2 : length;

		this.head = { x: this.width / 2, y: this.height / 2 };

		let point: Point = { x: this.head.x - 1, y: this.head.y };

		this.head.prev = point;
		point.next = this.head;

		for (let i = 0; i < bodyLen - 2; i++) {
			const newPoint: Point = { x: point.x - 1, y: point.y };
			
			point.prev = newPoint;
			newPoint.next = point;
			point = newPoint;
		}

		this.tail = point;
	}

	private getBodySet = (): Set<number> => {
		const set: Set<number> = new Set<number>();
		let point: Point | undefined = this.head;

		while (point) {
			set.add(point.x + point.y * this.width)

			point = point.prev;
		}

		return set;
	}

	private getRandomInt = (max: number): number => Math.floor(Math.random() * max);

	private comparePoints = ({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point) => x1 === x2 && y1 === y2;
}
