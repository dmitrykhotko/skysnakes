import {
	BODY_PART_HIT_WEIGHT,
	BODY_PART_RAM_WEIGHT,
	BULLET_SPEED,
	FRIENDLY_FIRE_WEIGHT,
	HEAD_SHOT_AWARD,
	HEIGHT,
	KILL_AWARD,
	RESPAWN_DELAY,
	SNAKE_SPEED,
	WIDTH
} from '../../utils/constants';
import { DamageType, Player } from '../../utils/enums';
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

type DelayedTask = {
	delay: number;
	task: someFunc;
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
	private delayedTasks = [] as DelayedTask[];

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

	step = (): void => {
		this.steps++;

		this.runDelayedTasks();

		const moveBullets = !(this.steps % this.bulletStep);
		const moveSnakes = !(this.steps % this.snakeStep);

		moveBullets && this.callIfInProgress(this.moveBullets);
		moveSnakes && this.callIfInProgress(this.moveSnakes);

		this.steps === this.stepsNum && (this.steps = 0);
	};

	private delay = (task: someFunc, delay: number): void => {
		this.delayedTasks.push({
			delay,
			task
		});
	};

	private runDelayedTasks = (): void => {
		const delayedTasks = [] as DelayedTask[];

		for (let i = 0; i < this.delayedTasks.length; i++) {
			const item = this.delayedTasks[i];

			item.delay--;
			item.delay ? delayedTasks.push(item) : item.task();
		}

		this.delayedTasks = delayedTasks;
	};

	private callIfInProgress = (callMe: someFunc, ...params: unknown[]): unknown => {
		const { inProgress } = this.getState();
		return inProgress ? callMe(...params) : undefined;
	};

	private moveBullets = (): void => {
		BulletsManager.move();

		const victim = this.checkHits();
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

		this.judge();
		victim && this.respawn(victim);
	};

	private moveSnakeMiddleware = (id: Player, head: Point): boolean => {
		const success = this.faceCoin(head);
		success && state.dispatch(ArenaActions.incScore(id));

		return !success;
	};

	private moveSnakes = (): void => {
		SnakesManager.move(this.moveSnakeMiddleware);

		const actions = [] as Action[];
		const snakes = SnakesUtils.get();
		const victims = [];

		for (let i = 0; i < snakes.length; i++) {
			const { id, head } = snakes[i];
			const { result: facedSnake, actions: facedSnakeActions } = this.faceSnakeCheck(id, head);

			if (facedSnake) {
				actions.push(...facedSnakeActions);
				victims.push(id);

				this.finish(id);

				continue;
			}

			const { result: strategyResult, actions: strategyActions } = this.runStrategy(head, id, this.arenaStrategy);
			actions.push(...strategyActions);

			if (!strategyResult) {
				victims.push(id);
				this.finish(id);

				continue;
			}
		}

		state.dispatch(...actions);

		const victim = this.checkHits();
		this.judge();

		victim && victims.push(victim);
		victims.length && this.respawn(...victims);
	};

	private faceSnakeCheck = (id: Player, head: Point): ResultWitActions => {
		const actions = [] as Action[];
		const facedSnake = SnakesManager.faceObject(head);

		if (!facedSnake) {
			return { result: false, actions: [] };
		}

		const { id: facedPlayer, point: facedPoint } = facedSnake;

		if (facedPlayer !== id) {
			const { result: cutRes, actions: cutActions } = SnakesManager.cutSnake(facedPlayer, facedPoint);
			actions.push(...cutActions, this.addScore(id, facedPlayer, cutRes));
		}

		return { result: true, actions };
	};

	private addScore = (killer: Player, victim: Player, damage = 1, damageType = DamageType.ram): Action => {
		let bodyPartWeight = 1;
		let scoreDelta = 0;

		switch (damageType) {
			case DamageType.death:
				scoreDelta += KILL_AWARD;
				break;
			case DamageType.headShot:
				scoreDelta += HEAD_SHOT_AWARD;
				break;
			case DamageType.hit:
				bodyPartWeight = BODY_PART_HIT_WEIGHT;
				break;
			case DamageType.ram:
			default:
				bodyPartWeight = BODY_PART_RAM_WEIGHT;
				break;
		}

		const bodyFactor = bodyPartWeight * (killer === victim ? -FRIENDLY_FIRE_WEIGHT : 1);
		scoreDelta += Math.ceil(damage * bodyFactor);

		return ArenaActions.addScore(scoreDelta, killer);
	};

	private checkHits = (): Player | undefined => {
		const bullets = state.get<BulletsStore>().bullets;

		for (let i = 0; i < bullets.length; i++) {
			const bullet = bullets[i];
			const { player: killer, point: bulletPoint } = bullet;
			const snakeShotResult = SnakesManager.faceObject(bulletPoint, false);

			if (!snakeShotResult) {
				continue;
			}

			const { id: victim } = snakeShotResult;
			const {
				result: { damage, isDead, isHeadShot },
				actions: hitActions
			} = SnakesManager.hit(snakeShotResult);

			const damageType = isHeadShot ? DamageType.headShot : isDead ? DamageType.death : DamageType.hit;
			const addScoreAction = this.addScore(killer, victim, damage, damageType);

			state.dispatch(...BulletsManager.removeBullet(bullet), ...hitActions, addScoreAction);

			if (isDead) {
				const playerId = snakeShotResult.id;

				this.finish(playerId);
				return playerId;
			}
		}
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

	private respawn = (...ids: Player[]): void => {
		SnakesManager.removeSnakes(ids);

		this.callIfInProgress(
			this.delay as someFunc,
			() => {
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
			},
			RESPAWN_DELAY
		);
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
