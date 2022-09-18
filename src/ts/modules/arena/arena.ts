import { HEIGHT, WIDTH } from '../../utils/constants';
import { Direction, Player } from '../../utils/enums';
import { comparePoints } from '../../utils/helpers';
import { Point } from '../../utils/types';
import { ArenaStrategy } from './strategies/arenaStrategy';
import { Serpentarium, SnakeData } from '../snake/serpentarium';
import { SnakeState } from '../snake/snake';

type Score = {
	deaths: number;
	coins: number;
};

export type ArenaState = {
	inProgress: boolean;
	coin: Point;
	snakes: Record<Player, SnakeState>;
	width: number;
	height: number;
	score: Record<Player, Score>;
	loosers: Player[];
};

export type ArenaProps = {
	directions: Direction[];
	strategy: ArenaStrategy;
	deathsNum: number;
	width?: number;
	height?: number;
};

const defaultProps = {
	width: WIDTH,
	height: HEIGHT
};

export class Arena {
	private static scoreInitialized = false;
	private static score = {} as Record<Player, Score>;

	private snakes!: Serpentarium;
	private strategy!: ArenaStrategy;
	private cellsNum!: number;
	private coin = { x: 0, y: 0 } as Point;
	private inProgress = true;
	private initialData: SnakeData[];
	private deathsNum: number;
	private loosers = [] as Player[];
	private width = WIDTH;
	private height = HEIGHT;

	constructor(props: ArenaProps) {
		const aProps = { ...defaultProps, ...props };
		const { directions } = aProps;

		({ strategy: this.strategy, width: this.width, deathsNum: this.deathsNum, height: this.height } = aProps);

		this.initialData = directions.map(d => ({ head: this.getStartPoint(d), direction: d }));
		this.cellsNum = this.width * this.height;
		this.snakes = new Serpentarium(this.initialData);
		this.makeCoin();

		this.initScore();
	}

	static resetScore = (): void => {
		Arena.score = {} as Record<Player, Score>;
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
		score: Arena.score,
		loosers: this.loosers
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

	private initScore = () => {
		const players = this.snakes.getPlayers();

		if (Arena.scoreInitialized && Object.keys(Arena.score).length === players.length) {
			return;
		}

		Arena.scoreInitialized = true;
		Arena.score = players.reduce((acc, player) => {
			acc[player] = { deaths: 0, coins: 0 };
			return acc;
		}, {} as Record<Player, Score>);
	};

	private handleMoveHead = (states: Record<Player, Point>): Player[] => {
		const ids: Player[] = [];

		Object.entries(states).forEach(([snakeId, point]) => {
			const id = +snakeId as Player;

			if (this.snakes.faceBody(point)) {
				return this.finish(id);
			}

			const success = this.strategy.run(point, this, id);

			if (!success) {
				return this.finish(id);
			}

			if (this.faceCoin(point)) {
				Arena.score[id].coins++;
				return this.makeCoin();
			}

			ids.push(id);
		});

		!this.inProgress && this.judge();

		return ids;
	};

	private finish = (id: Player): void => {
		Arena.score[id].deaths++;
		this.inProgress = false;
	};

	private judge = (): void => {
		Object.entries(Arena.score).forEach(([id, score]) => {
			const player = +id as Player;

			if (score.deaths === this.deathsNum) {
				this.loosers.push(player);
				Arena.scoreInitialized = false;
			}
		});

		this.loosers.length && (Arena.scoreInitialized = false);
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
