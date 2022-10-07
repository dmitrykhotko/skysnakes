import { BULLET_SPEED, HEIGHT, SET_IN_PROGRESS, SNAKE_SPEED, WIDTH } from '../../utils/constants';
import { Direction, Player } from '../../utils/enums';
import { comparePoints, getRandomInt, lcm } from '../../utils/helpers';
import {
	Action,
	ArenaActions,
	ArenaStore,
	ArenaState,
	ShootingActions,
	ShootingStore,
	SnakesStore,
	state,
	CommonActions
} from '../redux';
import { Point, ResultWitActions, Score } from '../../utils/types';
import { Observer } from '../observable/observer';
import { Serpentarium } from '../characters/snake';
import { BulletsManager } from '../characters/bullets/bulletsManager';
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
	private steps!: number;
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

		state.subscribe(this.judge as Observer, SET_IN_PROGRESS);
	}

	start = (
		directions: Direction[],
		deathsNum: number,
		reset: boolean,
		arenaStrategy?: ArenaStrategy,
		bulletStrategy?: ArenaStrategy
	): void => {
		const { score, loosers } = this.getState();
		const resetArena = Object.keys(score).length !== directions.length || loosers.length || reset;

		state.dispatch(resetArena ? CommonActions.resetGame() : ShootingActions.reset());

		this.steps = 0;
		this.deathsNum = deathsNum;
		this.snakes = new Serpentarium(directions.map(d => ({ head: this.getStartPoint(d), direction: d })));

		this.arenaStrategy = arenaStrategy;
		this.bulletStrategy = bulletStrategy;

		resetArena && this.initScore();
		state.dispatch(this.setCoin(), ArenaActions.setInProgress(true));
	};

	move = (): void => {
		this.steps++;

		const moveBullets = !(this.steps % this.bulletStep);

		if (moveBullets) {
			BulletsManager.move();
			this.handleMoveBullets();
		}

		const { inProgress } = this.getState();
		const moveSnakes = inProgress && !(this.steps % this.snakeStep);

		if (moveSnakes) {
			// TODO: make Serpentarium an abstract class
			this.snakes.move();
			this.handleMoveSnakes();

			state.dispatch(...this.checkHits());
		}

		this.steps === this.stepsNum && (this.steps = 0);
	};

	private handleMoveBullets = (): void => {
		const actions = [...this.checkHits()];
		const bullets = Object.values(state.get<ShootingStore>().shooting.bullets);

		for (let i = 0; i < bullets.length; i++) {
			const bullet = bullets[i];
			const { id, point } = bullet;

			const { result: faceCoinSuccess, actions: faceCoinActions } = this.faceCoin(point);
			const { result: strategySuccess, actions: strategyActions = [] } = this.runStrategy(
				point,
				id,
				this.bulletStrategy
			);

			actions.push(...strategyActions, ...faceCoinActions);
			(faceCoinSuccess || !strategySuccess) && actions.push(...BulletsManager.removeBullet(bullet));
		}

		state.dispatch(...actions);
	};

	private handleMoveSnakes = (): void => {
		const actions = [] as Action[];
		const heads = state.get<SnakesStore>().snakes;
		const states = Object.entries(heads);

		for (let i = 0; i < states.length; i++) {
			const [snakeId, { head }] = states[i];
			const id = +snakeId;

			if (this.snakes.faceObject(head)) {
				actions.push(...this.finish(id));
				continue;
			}

			const { result: success, actions: strategyActions } = this.runStrategy(head, id, this.arenaStrategy);
			actions.push(...strategyActions);

			if (!success) {
				actions.push(...this.finish(id));
				continue;
			}

			const { result: faceCoinSuccess, actions: faceCoinActions } = this.faceCoin(head);

			if (faceCoinSuccess) {
				this.snakes.grow(id);
				actions.push(ArenaActions.incCoins(id), ...faceCoinActions);
			}
		}

		state.dispatch(...actions);
	};

	private checkHits = (): Action[] => {
		const actions = [] as Action[];
		const bullets = Object.values(state.get<ShootingStore>().shooting.bullets);

		for (let i = 0; i < bullets.length; i++) {
			const bullet = bullets[i];
			const { point } = bullet;
			const snakeShotResult = this.snakes.faceObject(point, false);

			if (!snakeShotResult) {
				continue;
			}

			const { result, actions: hitActions } = BulletsManager.hit(bullet, snakeShotResult);
			actions.push(...hitActions);

			result && actions.push(...this.finish(snakeShotResult.id));

			actions.push(...actions);
		}

		return actions;
	};

	private runStrategy = (point: Point, id: number, strategy?: ArenaStrategy): ResultWitActions =>
		strategy ? strategy.run(point, this.width, this.height, id) : { result: true, actions: [] };

	private setCoin = (): Action => {
		const freeCells = this.getFreeCells();
		const coinCellIndex = getRandomInt(freeCells.length);
		const coinCellValue = freeCells[coinCellIndex];
		const x = coinCellValue % this.width;
		const y = (coinCellValue - x) / this.width;

		return ArenaActions.setCoin({ x, y });
	};

	private initScore = (): void => {
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

	private getState = (): ArenaState => state.get<ArenaStore>().arena;

	private finish = (id: Player): Action[] => [ArenaActions.incDeaths(id), ArenaActions.setInProgress(false)];

	private judge = (store: ArenaStore): void => {
		const { score, inProgress } = store.arena;

		if (inProgress) {
			return;
		}

		const loosers = [] as Player[];

		Object.entries(score).forEach(([id, score]) => {
			const player = +id;

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

	private faceCoin = (object: Point): ResultWitActions =>
		comparePoints(object, this.getState().coin)
			? {
					result: true,
					actions: [this.setCoin()]
			  }
			: {
					result: false,
					actions: []
			  };

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
