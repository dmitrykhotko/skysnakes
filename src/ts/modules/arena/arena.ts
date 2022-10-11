import { BULLET_SPEED, HEIGHT, SET_IN_PROGRESS, SNAKE_SPEED, WIDTH } from '../../utils/constants';
import { Direction, Player } from '../../utils/enums';
import { comparePoints, getRandomInt, lcm } from '../../utils/helpers';
import {
	Action,
	ArenaActions,
	ArenaStore,
	ArenaState,
	BulletsActions,
	BulletsStore,
	state,
	CommonActions
} from '../redux';
import { Point, ResultWitActions, DirectionWithId, Id } from '../../utils/types';
import { Observer } from '../observable/observer';
import { SnakesManager } from '../characters/snakes/snakesManager';
import { BulletsManager } from '../characters/bullets/bulletsManager';
import { ArenaStrategy } from './strategies';
import { SnakesUtils } from '../../utils';

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
		snakesInitial: DirectionWithId[],
		lives: number,
		reset: boolean,
		arenaStrategy?: ArenaStrategy,
		bulletStrategy?: ArenaStrategy
	): void => {
		const { playersStat, winners } = this.getState();
		const resetArena = playersStat.length !== snakesInitial.length || winners.length || reset;
		const actions = [this.setCoin(), ArenaActions.setInProgress(true)];

		state.dispatch(resetArena ? CommonActions.resetGame() : BulletsActions.reset());

		this.steps = 0;

		SnakesManager.initSnakes(snakesInitial.map(item => ({ ...item, head: this.getStartPoint(item.direction) })));

		this.arenaStrategy = arenaStrategy;
		this.bulletStrategy = bulletStrategy;

		resetArena && actions.push(...this.initScore(lives));

		state.dispatch(...actions);
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
			SnakesManager.move((id: Player, head: Point) => {
				const success = this.faceCoin(head);
				success && state.dispatch(ArenaActions.incCoins(id));

				return !success;
			});

			this.handleMoveSnakes();
			state.dispatch(...this.checkHits().actions);
		}

		this.steps === this.stepsNum && (this.steps = 0);
	};

	private handleMoveBullets = (): void => {
		const { result: isHit, actions: hitActions } = this.checkHits();
		const actions = [...hitActions];

		if (isHit) {
			return state.dispatch(...actions);
		}

		const bullets = state.get<BulletsStore>().bullets;

		for (let i = 0; i < bullets.length; i++) {
			const bullet = bullets[i];
			const { id, point } = bullet;

			const facedCoin = this.faceCoin(point);
			const { result: bulletIsOk, actions: adjustBulletActions } = this.runStrategy(
				point,
				id,
				this.bulletStrategy
			);

			actions.push(...adjustBulletActions);
			(facedCoin || !bulletIsOk) && actions.push(...BulletsManager.removeBullet(bullet));
		}

		state.dispatch(...actions);
	};

	private handleMoveSnakes = (): void => {
		const actions = [] as Action[];
		const snakes = SnakesUtils.get();

		for (let i = 0; i < snakes.length; i++) {
			const { id, head } = snakes[i];

			if (SnakesManager.faceObject(head)) {
				actions.push(...this.finish(id));
				continue;
			}

			const { result: snakeIsOk, actions: adjustSnakeActions } = this.runStrategy(head, id, this.arenaStrategy);
			actions.push(...adjustSnakeActions);

			if (!snakeIsOk) {
				actions.push(...this.finish(id));
				continue;
			}
		}

		state.dispatch(...actions);
	};

	private checkHits = (): ResultWitActions => {
		const actions = [] as Action[];
		const bullets = state.get<BulletsStore>().bullets;

		for (let i = 0; i < bullets.length; i++) {
			const bullet = bullets[i];
			const { point } = bullet;
			const snakeShotResult = SnakesManager.faceObject(point, false);

			if (!snakeShotResult) {
				continue;
			}

			const { result: isHit, actions: hitActions } = BulletsManager.hit(bullet, snakeShotResult);
			actions.push(...hitActions);

			if (isHit) {
				actions.push(...this.finish(snakeShotResult.id));

				return {
					result: isHit,
					actions
				};
			}
		}

		return {
			result: false,
			actions
		};
	};

	private runStrategy = (point: Point, id: Id, strategy?: ArenaStrategy): ResultWitActions =>
		strategy ? strategy.run(point, this.width, this.height, id) : { result: true, actions: [] };

	private setCoin = (): Action => {
		const freeCells = this.getFreeCells();
		const coinCellIndex = getRandomInt(freeCells.length);
		const coinCellValue = freeCells[coinCellIndex];
		const x = coinCellValue % this.width;
		const y = (coinCellValue - x) / this.width;

		return ArenaActions.setCoin({ x, y });
	};

	private initScore = (lives: number): Action[] => {
		const ids = SnakesUtils.get().map(({ id }) => id);
		return [ArenaActions.setScore(ids.map(id => ({ id, lives, score: 0 }))), ArenaActions.setWinners([])];
	};

	private getState = (): ArenaState => state.get<ArenaStore>().arena;

	private finish = (id: Player): Action[] => [ArenaActions.decLives(id), ArenaActions.setInProgress(false)];

	private judge = (store: ArenaStore): void => {
		const { playersStat, inProgress } = store.arena;

		if (inProgress) {
			return;
		}

		if (!playersStat.some(({ lives }) => lives === 0)) {
			return;
		}

		const maxScore = Math.max(...playersStat.map(({ score }) => score));
		const winners = playersStat.filter(stat => stat.score === maxScore).map(({ id }) => id);

		winners.length && state.dispatch(ArenaActions.setWinners(winners));
	};

	private getFreeCells = (): number[] => {
		const cells: number[] = [];
		const bodiesSet = SnakesManager.getBodiesSet(this.width);

		for (let i = 0; i < this.width * this.height; i++) {
			if (bodiesSet.has(i)) {
				continue;
			}

			cells.push(i);
		}

		return cells;
	};

	private faceCoin = (object: Point): boolean => {
		const success = comparePoints(object, this.getState().coin);
		success && state.dispatch(this.setCoin());

		return success;
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
