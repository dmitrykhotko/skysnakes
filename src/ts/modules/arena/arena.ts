import { BULLET_SPEED, HEIGHT, SNAKE_SPEED, WIDTH } from '../../utils/constants';
import { Player } from '../../utils/enums';
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
import { SnakesManager } from '../characters/snakes/snakesManager';
import { BulletsManager } from '../characters/bullets/bulletsManager';
import { ArenaStrategy } from './strategies';
import { Hlp, SnakesUtils } from '../../utils';

export type ArenaProps = {
	width?: number;
	height?: number;
	snakeSpeed?: number;
	bulletSpeed?: number;
};

type someFunc = (...params: unknown[]) => unknown;

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
	private snakesInitial!: DirectionWithId[];

	constructor(props: ArenaProps) {
		const aProps = { ...defaultProps, ...props };

		({ width: this.width, height: this.height } = aProps);

		const { snakeSpeed, bulletSpeed } = aProps;

		this.stepsNum = Hlp.lcm(snakeSpeed, bulletSpeed);
		this.snakeStep = this.stepsNum / snakeSpeed;
		this.bulletStep = this.stepsNum / bulletSpeed;
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

		this.snakesInitial = snakesInitial;
		SnakesManager.initSnakes(this.snakesInitial, this.width, this.height);

		this.arenaStrategy = arenaStrategy;
		this.bulletStrategy = bulletStrategy;

		resetArena && actions.push(...this.initScore(lives));

		state.dispatch(...actions);
	};

	move = (): void => {
		this.steps++;

		const moveBullets = !(this.steps % this.bulletStep);
		const moveSnakes = !(this.steps % this.snakeStep);

		moveBullets && this.callIfInProgress(this.moveBullets);
		moveSnakes && this.callIfInProgress(this.moveSnakes);

		this.steps === this.stepsNum && (this.steps = 0);
	};

	private callIfInProgress = (callMe: someFunc, ...params: unknown[]): unknown => {
		const { inProgress } = this.getState();
		return inProgress ? callMe(...params) : undefined;
	};

	private moveBullets = (): void => {
		BulletsManager.move();

		if (this.checkHits()) {
			return;
		}

		const actions = [];
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

	private moveSnakes = (): void => {
		SnakesManager.move((id: Player, head: Point) => {
			const success = this.faceCoin(head);
			success && state.dispatch(ArenaActions.incCoins(id));

			return !success;
		});

		const actions = [] as Action[];
		const snakes = SnakesUtils.get();
		const respawnPlayers = [];

		for (let i = 0; i < snakes.length; i++) {
			const { id, head } = snakes[i];

			if (SnakesManager.faceObject(head)) {
				this.finish(id);
				respawnPlayers.push(id);
				continue;
			}

			const { result: snakeIsOk, actions: adjustSnakeActions } = this.runStrategy(head, id, this.arenaStrategy);
			actions.push(...adjustSnakeActions);

			if (!snakeIsOk) {
				this.finish(id);
				respawnPlayers.push(id);
				continue;
			}
		}

		state.dispatch(...actions);
		this.checkHits();
		this.judge();

		respawnPlayers.length && this.callIfInProgress(this.respawn as someFunc, respawnPlayers);
	};

	private checkHits = (): boolean => {
		const bullets = state.get<BulletsStore>().bullets;

		for (let i = 0; i < bullets.length; i++) {
			const bullet = bullets[i];
			const { point } = bullet;
			const snakeShotResult = SnakesManager.faceObject(point, false);

			if (!snakeShotResult) {
				continue;
			}

			const isHit = BulletsManager.hit(bullet, snakeShotResult);

			if (isHit) {
				const playerId = snakeShotResult.id;

				this.finish(playerId);
				this.judge();
				this.callIfInProgress(this.respawn as someFunc, [playerId]);

				return true;
			}
		}

		return false;
	};

	private runStrategy = (point: Point, id: Id, strategy?: ArenaStrategy): ResultWitActions =>
		strategy ? strategy.run(point, this.width, this.height, id) : { result: true, actions: [] };

	private setCoin = (): Action => {
		const freeCells = this.getFreeCells();
		const coinCellIndex = Hlp.randomInt(freeCells.length);
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

	private finish = (id: Player): void => {
		state.dispatch(ArenaActions.decLives(id));
	};

	private judge = (): void => {
		const { playersStat } = this.getState();

		if (!playersStat.some(({ lives }) => lives === 0)) {
			return;
		}

		const maxScore = Math.max(...playersStat.map(({ score }) => score));
		const winners = playersStat.filter(stat => stat.score === maxScore).map(({ id }) => id);

		winners.length && state.dispatch(ArenaActions.setInProgress(false), ArenaActions.setWinners(winners));
	};

	private respawn = (ids: Player[]): void => {
		const snakesInitial = [];

		for (let i = 0; i < ids.length; i++) {
			for (let j = 0; j < this.snakesInitial.length; j++) {
				const item = this.snakesInitial[j];

				if (ids[i] === item.id) {
					snakesInitial.push(item);
				}
			}
		}

		SnakesManager.initSnakes(snakesInitial, this.width, this.height);
	};

	private getFreeCells = (): number[] => {
		const cells: number[] = [];
		const set = new Set<number>([
			...SnakesManager.getSnakesSet(this.width),
			...BulletsManager.getBulletsSet(this.width)
		]);

		for (let i = 0; i < this.width * this.height; i++) {
			if (set.has(i)) {
				continue;
			}

			cells.push(i);
		}

		return cells;
	};

	private faceCoin = (object: Point): boolean => {
		const success = Hlp.comparePoints(object, this.getState().coin);
		success && state.dispatch(this.setCoin());

		return success;
	};
}
