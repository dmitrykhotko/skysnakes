import { HEIGHT, WIDTH } from '../../utils/constants';
import { Direction, Player } from '../../utils/enums';
import { comparePoints } from '../../utils/helpers';
import { Point } from '../../utils/types';
import { ArenaStrategy } from './strategies/arenaStrategy';
import { Serpentarium, SnakeData } from '../snake/serpentarium';
import { SnakeState } from '../snake/snake';

export type ArenaState = {
	inProgress: boolean;
	coin: Point;
	snakes: Record<Player, SnakeState>;
	width: number;
	height: number;
	score: Record<Player, number>;
};

export class Arena {
	private static score = {} as Record<Player, number>;

	private snakes!: Serpentarium;
	private cellsNum!: number;
	private coin = { x: 0, y: 0 } as Point;
	private inProgress = true;
	private initialData: SnakeData[];

	constructor(
		directions: Direction[],
		private strategy: ArenaStrategy,
		private width = WIDTH,
		private height = HEIGHT
	) {
		this.initialData = directions.map(d => ({ head: this.getStartPoint(d), direction: d }));
		this.cellsNum = this.width * this.height;
		this.snakes = new Serpentarium(this.initialData);
		this.makeCoin();
	}

	static resetScore = (): void => {
		Arena.score = {} as Record<Player, number>;
	};

	move = (): void => {
		const heads = this.snakes.moveHead();
		const ids = this.handleMoveHead(heads);
		this.snakes.moveTail(ids);
	};

	getState = (): ArenaState => ({
		inProgress: this.inProgress,
		coin: this.coin,
		snakes: this.snakes.getState(),
		width: this.width,
		height: this.height,
		score: Arena.score
	});

	makeCoin = (): void => {
		const freeCells = this.getFreeCells();
		const coinCellIndex = this.getRandomInt(freeCells.length);
		const coinCellValue = freeCells[coinCellIndex];
		const x = coinCellValue % this.width;
		const y = (coinCellValue - x) / this.width;

		this.coin = { x, y };
	};

	sendDirection = (snakeId: Player, direction: Direction): void => {
		this.snakes.sendDirection(snakeId, direction);
	};

	setHead = (snakeId: Player, head: Point): void => {
		this.snakes.setHead(snakeId, head);
	};

	private handleMoveHead = (states: Record<Player, Point>): Player[] => {
		const ids: Player[] = [];

		Object.entries(states).forEach(([snakeId, point]) => {
			const id = parseInt(snakeId) as Player;

			if (this.snakes.faceBody(point)) {
				!Arena.score[id] && (Arena.score[id] = 0);
				Arena.score[id]++;

				return (this.inProgress = false);
			}

			const success = this.strategy.run(point, this, id);

			if (!success) {
				return (this.inProgress = false);
			}

			if (this.faceCoin(point)) {
				this.makeCoin();
				this.snakes.incScore(id);
				return;
			}

			ids.push(id);
		});

		return ids;
	};

	private getFreeCells = (): number[] => {
		const cells: number[] = [];
		const bodiesSet = this.snakes.getBodiesSet(this.width);

		for (let i = 0; i < this.cellsNum; i++) {
			if (bodiesSet.has(i)) {
				continue;
			}

			cells.push(i);
		}

		return cells;
	};

	private faceCoin = (head: Point): boolean => {
		return comparePoints(head, this.coin);
	};

	private getRandomInt = (max: number): number => Math.floor(Math.random() * max);

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
	};
}
