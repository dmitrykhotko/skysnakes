import { BULLET_SPEED, HEIGHT, SET_IN_PROGRESS, SNAKE_SPEED, WIDTH } from '../../utils/constants';
import { Direction, Player } from '../../utils/enums';
import { comparePoints, lcm } from '../../utils/helpers';
import {
	Action,
	ArenaActions,
	ArenaStore,
	ShootingActions,
	ShootingStore,
	SnakesActions,
	SnakesStore,
	state
} from '../redux';
import { Point, Score } from '../../utils/types';
import { Observer } from '../observable/observer';
import { Serpentarium } from '../characters/snake';
import { BulletsManager } from '../characters/bullets/bulletsManager';
import { ArenaState } from '../redux/reducers/instances/arena';
import { ArenaStrategy } from './strategies';

export type ArenaProps = {
	width?: number;
	height?: number;
	snakeSpeed?: number;
	bulletSpeed?: number;
};

const defaultProps = {
	width: WIDTH,
	height: HEIGHT,
	snakeSpeed: SNAKE_SPEED,
	bulletSpeed: BULLET_SPEED
};

export class Arena {
	private snakes!: Serpentarium;
	private deathsNum!: number;
	private width: number;
	private height: number;
	private stepsNum: number;
	private steps = 0;
	private snakeStep: number;
	private bulletStep: number;
	private arenaStrategy?: ArenaStrategy;
	private bulletStrategy?: ArenaStrategy;

	constructor(props: ArenaProps) {
		const aProps = { ...defaultProps, ...props };

		({ width: this.width, height: this.height } = aProps);

		const { snakeSpeed, bulletSpeed } = aProps;

		this.stepsNum = lcm(snakeSpeed, bulletSpeed);
		this.snakeStep = this.stepsNum / snakeSpeed;
		this.bulletStep = this.stepsNum / bulletSpeed;

		this.subscribe();
	}

	start = (
		directions: Direction[],
		deathsNum: number,
		reset: boolean,
		arenaStrategy?: ArenaStrategy,
		bulletStrategy?: ArenaStrategy
	): void => {
		const { score, loosers } = this.getState();
		const resetScore = Object.keys(score).length !== directions.length || loosers.length || reset;

		this.steps = 0;
		this.deathsNum = deathsNum;
		this.snakes = new Serpentarium(directions.map(d => ({ head: this.getStartPoint(d), direction: d })));

		this.arenaStrategy = arenaStrategy;
		this.bulletStrategy = bulletStrategy;

		const actions = [this.setCoin(), ArenaActions.setInProgress(true)];
		resetScore && this.resetScore();

		state.dispatch(...actions);
	};

	move = (): void => {
		this.steps++;

		const actions = [] as Action[];
		const moveBullets = !(this.steps % this.bulletStep);
		const moveSnakes = !(this.steps % this.snakeStep);

		if (moveBullets) {
			BulletsManager.move();
		}

		if (moveSnakes) {
			// TODO: make Serpentarium an abstract class
			this.snakes.move();
		}

		this.steps === this.stepsNum && (this.steps = 0);

		moveBullets && actions.push(...this.handleMoveBullets());
		moveSnakes && actions.push(...this.handleMoveSnakes());

		actions.length && state.dispatch(...actions);
	};

	private handleMoveBullets = (): Action[] => {
		const actions = [] as Action[];
		const bullets = Object.values((state.get() as ShootingStore).shooting.bullets);

		for (let i = 0; i < bullets.length; i++) {
			const { id, point } = bullets[i];
			const data = this.snakes.faceObject(point, false);
			const facedCoin = this.faceCoin(point);
			const success = this.runStrategy(point, id, this.bulletStrategy);
			const removeBullet = facedCoin || !success || data;

			facedCoin && actions.push(this.setCoin());
			removeBullet && actions.push(ShootingActions.removeBullet(id));

			if (data) {
				// fix when tail becomes equal to head
				actions.push(SnakesActions.setTail({ ...data.point, ...{ prev: undefined } }, data.id));
			}
		}

		return actions;
	};

	private handleMoveSnakes = (): Action[] => {
		const actions = [] as Action[];
		const heads = (state.get() as SnakesStore).snakes;
		const states = Object.entries(heads);

		for (let i = 0; i < states.length; i++) {
			const [snakeId, { head }] = states[i];
			const id = +snakeId;

			if (this.snakes.faceObject(head)) {
				actions.push(...this.finish(id));
				continue;
			}

			const success = this.runStrategy(head, id, this.arenaStrategy);

			if (!success) {
				actions.push(...this.finish(id));
				continue;
			}

			if (this.faceCoin(head)) {
				this.snakes.grow(id);
				actions.push(ArenaActions.incCoins(id), this.setCoin());
			}
		}

		return actions;
	};

	private runStrategy = (point: Point, id: number, strategy?: ArenaStrategy): boolean =>
		strategy ? strategy.run(point, this.width, this.height, id) : true;

	private subscribe = (): void => {
		state.subscribe(this.onInProgressChanged as Observer, SET_IN_PROGRESS);
	};

	private onInProgressChanged = (store: ArenaStore): void => {
		this.judge(store);
	};

	private setCoin = (): Action => {
		const freeCells = this.getFreeCells();
		const coinCellIndex = this.getRandomInt(freeCells.length);
		const coinCellValue = freeCells[coinCellIndex];
		const x = coinCellValue % this.width;
		const y = (coinCellValue - x) / this.width;

		return ArenaActions.setCoin({ x, y });
	};

	private resetScore = (): void => {
		state.dispatch(
			ArenaActions.setScore(
				this.snakes.getPlayers().reduce((acc, player) => {
					acc[player] = { deaths: 0, coins: 0 };
					return acc;
				}, {} as Record<Player, Score>)
			),
			ArenaActions.setLoosers([])
		);
	};

	private getState = (): ArenaState => (state.get() as ArenaStore).arena;

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

		loosers.length && state.dispatch(ArenaActions.setLoosers(loosers));
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

	private faceCoin = (object: Point): boolean => {
		const { coin } = this.getState();
		return comparePoints(object, coin);
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
