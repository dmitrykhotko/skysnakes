import { HEIGHT, SET_IN_PROGRESS, SET_SCORE_INITIALIZED, WIDTH } from '../../utils/constants';
import { Direction, Player } from '../../utils/enums';
import { comparePoints } from '../../utils/helpers';
import { Action, ArenaActions, ArenaStore, state } from '../redux';
import { Point, Score, SnakeState } from '../../utils/types';
import { Observer } from '../observable/observer';
import { Serpentarium } from '../snake/serpentarium';

export type ArenaState = {
	inProgress: boolean;
	coin: Point;
	snakes: Record<Player, SnakeState>;
	score: Record<Player, Score>;
	loosers: Player[];
};

export type ArenaProps = {
	width?: number;
	height?: number;
};

const defaultProps = {
	width: WIDTH,
	height: HEIGHT
};

export class Arena {
	private snakes!: Serpentarium;
	private deathsNum!: number;
	private width: number;
	private height: number;

	constructor(props: ArenaProps) {
		const aProps = { ...defaultProps, ...props };

		({ width: this.width, height: this.height } = aProps);

		this.subscribe();
	}

	start = (directions: Direction[], deathsNum: number, reset = false): void => {
		const { scoreInitialized } = this.getStore();
		const initScore = scoreInitialized === undefined || reset;

		this.deathsNum = deathsNum;
		this.snakes = new Serpentarium(directions.map(d => ({ head: this.getStartPoint(d), direction: d })));

		const actions = [this.setCoin(), ArenaActions.setInProgress(true)];
		initScore && actions.push(ArenaActions.setScoreInitialized(false));

		this.dispatch(...actions);
	};

	move = (): void => {
		const states = this.snakes.move();
		const actionsList = [] as Action[];

		Object.entries(states).forEach(([snakeId, point]) => {
			const id = +snakeId as Player;

			if (this.snakes.faceBody(point)) {
				return actionsList.push(...this.finish(id));
			}

			const { strategy } = this.getStore();
			const success = strategy.run(point, this.width, this.height, id);

			if (!success) {
				return actionsList.push(...this.finish(id));
			}

			if (this.faceCoin(point)) {
				this.snakes.grow(id);
				actionsList.push(ArenaActions.incCoins(id), this.setCoin());
				return;
			}
		});

		this.dispatch(...actionsList);
	};

	sendDirection = (snakeId: Player, direction: Direction): void => {
		this.snakes.sendDirection(snakeId, direction);
	};

	// setHead = (snakeId: Player, head: Point): void => {
	// 	this.snakes.setHead(snakeId, head);
	// };

	private subscribe = (): void => {
		state.subscribe(this.onInProgressChanged as Observer, SET_IN_PROGRESS);
		state.subscribe(this.onScoreInitializedChanged as Observer, SET_SCORE_INITIALIZED);
	};

	private onInProgressChanged = (newStore: ArenaStore): void => {
		this.judge(newStore);
	};

	private onScoreInitializedChanged = (newStore: ArenaStore): void => {
		this.initScore(newStore.arena.scoreInitialized);
	};

	private setCoin = (): Action => {
		const freeCells = this.getFreeCells();
		const coinCellIndex = this.getRandomInt(freeCells.length);
		const coinCellValue = freeCells[coinCellIndex];
		const x = coinCellValue % this.width;
		const y = (coinCellValue - x) / this.width;

		return ArenaActions.setCoin({ x, y });
	};

	private dispatch = (...actions: Action[]) => {
		state.dispatch(...actions);
	};

	private initScore = (initialized = false): void => {
		if (initialized) {
			return;
		}

		this.dispatch(
			ArenaActions.setScore(
				this.snakes.getPlayers().reduce((acc, player) => {
					acc[player] = { deaths: 0, coins: 0 };
					return acc;
				}, {} as Record<Player, Score>)
			),
			ArenaActions.setLoosers([]),
			ArenaActions.setScoreInitialized(true)
		);
	};

	private getStore = () => (state.get() as ArenaStore).arena;

	private finish = (id: Player): Action[] => [ArenaActions.incDeaths(id), ArenaActions.setInProgress(false)];

	private judge = (store: ArenaStore): void => {
		const { score, inProgress } = store.arena;

		if (inProgress) {
			return;
		}

		const loosers = [] as Player[];

		Object.entries(score).forEach(([id, score]) => {
			const player = +id as Player;

			if (score.deaths === this.deathsNum) {
				loosers.push(player);
			}
		});

		loosers.length && this.dispatch(ArenaActions.setLoosers(loosers), ArenaActions.setScoreInitialized(false));
	};

	private getFreeCells = (): number[] => {
		const cells: number[] = [];
		const bodiesSet = this.snakes.getBodiesSet(this.width);

		for (let i = 0; i < this.width * this.height; i++) {
			if (bodiesSet.has(i)) {
				continue;
			}

			cells.push(i);
		}

		return cells;
	};

	private faceCoin = (head: Point): boolean => {
		const { coin } = this.getStore();
		return comparePoints(head, coin);
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
