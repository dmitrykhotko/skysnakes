import { GameStatus, Player } from '../../common/enums';
import { Id, LinkedPoint, Size } from '../../common/types';
import { ArenaState, ArenaStore, BulletsStore, state } from '../redux';
import { Action, SnakesActions, StatActions } from '../redux/actions';
import { Stat } from '../stat/stat';
import { BULLET_SPEED, RESPAWN_SNAKE_DELAY, SNAKE_SPEED } from '../utils/constants';
import { DelayedTasks } from '../utils/delayedTasks';
import { DamageType } from '../utils/enums';
import { Hlp } from '../utils/hlp';
import { DirectionWithId, ResultWitActions } from '../utils/types';
import { Bullets } from './characters/bullets';
import { Coins } from './characters/coins';
import { Snakes } from './characters/snakes';

type someFunc = (...params: unknown[]) => unknown;

export class Arena {
	private stepsNum: number;
	private steps!: number;
	private snakeStep: number;
	private bulletStep: number;
	private snakesInitial!: DirectionWithId[];

	constructor() {
		this.stepsNum = Hlp.lcm(SNAKE_SPEED, BULLET_SPEED);
		this.snakeStep = this.stepsNum / SNAKE_SPEED;
		this.bulletStep = this.stepsNum / BULLET_SPEED;
	}

	start = (snakesInitial: DirectionWithId[]): void => {
		this.steps = 0;
		this.snakesInitial = snakesInitial;

		Snakes.init(this.snakesInitial);
		Coins.init();
	};

	tick = (): void => {
		this.steps++;

		const moveBullets = !(this.steps % this.bulletStep);
		const moveSnakes = !(this.steps % this.snakeStep);

		moveBullets && this.callIfInProgress(this.moveBullets);
		moveSnakes && this.callIfInProgress(this.moveSnakes);

		this.steps === this.stepsNum && (this.steps = 0);

		Coins.checkNumber();
	};

	private callIfInProgress = (callMe: someFunc, ...params: unknown[]): unknown => {
		const { status } = this.getState();
		return status === GameStatus.InProgress ? callMe(...params) : undefined;
	};

	private moveBullets = (): void => {
		Bullets.move();

		const { width, height } = Hlp.getSize();
		const { result: victim, actions: hitsActions } = this.checkHits();
		const actions = [...hitsActions];
		const bullets = state.get<BulletsStore>().bullets;

		for (let i = 0; i < bullets.length; i++) {
			const bullet = bullets[i];
			const { point } = bullet;
			const { x, y } = point;
			const faceCoin = !!Coins.checkCollisions(point).length;
			const facedWall = !(x === width || y === height || !~x || !~y);

			(faceCoin || !facedWall) && actions.push(...Bullets.remove(bullet));
		}

		state.dispatch(...actions);
		victim && this.respawn(victim);
	};

	private checkSnakeGrowth = (id: Player, head: LinkedPoint): number => {
		const facedCoins = Coins.checkCollisions(head);

		facedCoins.length && Stat.faceCoins(id, facedCoins);
		return facedCoins.length;
	};

	private moveSnakes = (): void => {
		const snakes = Snakes.get();
		const size = Hlp.getSize();
		const actions = [] as Action[];
		const victims = [];

		for (let i = 0; i < snakes.length; i++) {
			const { id } = snakes[i];

			Snakes.move(id, this.checkSnakeGrowth);

			const { head } = Snakes.getById(id);
			const { result: victimId, actions: ramActions } = this.checkRam(id, head);

			if (ramActions.length) {
				victims.push(id);
				actions.push(...ramActions, StatActions.decLives(id));

				if (!!~victimId) {
					victims.push(victimId);
					break;
				}

				continue;
			}

			actions.push(...this.checkWalls(head, id, size));
		}

		state.dispatch(...actions);

		const { result: victim, actions: hitsActions } = this.checkHits();

		state.dispatch(...hitsActions);
		victim && victims.push(victim);
		victims.length && this.respawn(...victims);
	};

	private checkWalls = (head: LinkedPoint, id: Player, { width, height }: Size): Action[] => {
		const actions = [] as Action[];
		let { x: headX, y: headY } = head;

		if (!!~headX && !!~headY && headX !== width && headY !== height) {
			return actions;
		}

		if (!~headX) {
			headX = width;
		} else if (headX === width) {
			headX = 0;
		}

		if (!~headY) {
			headY = height;
		} else if (headY === height) {
			headY = 0;
		}

		const newHead = { x: headX, y: headY, prev: head.prev };

		if (newHead.prev) {
			newHead.prev.next = newHead;
		} else {
			actions.push(SnakesActions.setTail(newHead, id));
		}

		actions.push(SnakesActions.setHead(newHead, id));

		return actions;
	};

	private checkRam = (killer: Player, head: LinkedPoint): ResultWitActions<Id> => {
		const actions = [] as Action[];
		const facedSnake = Snakes.checkCollisions(head);
		let result = -1;

		if (!facedSnake) {
			return {
				result,
				actions
			};
		}

		const { id: victim, point: facedPoint } = facedSnake;

		let victimDamage = 0;
		let killerDamage = 0;
		let victimPoints = [] as LinkedPoint[];
		let killerPoints = [] as LinkedPoint[];

		if (victim !== killer) {
			const { result: cutPoints, actions: cutActions } = Snakes.cut({
				id: victim,
				point: facedPoint
			});
			const isVictimDead = Hlp.comparePoints(facedPoint, Snakes.getById(victim).head);

			let victimDamageType = DamageType.Standard;

			killerPoints = Snakes.toArray(killer);
			killerDamage = killerPoints.length;

			victimPoints = cutPoints;
			victimDamage = victimPoints.length;

			if (isVictimDead) {
				result = victim;
				victimDamageType = DamageType.Death;
			}

			actions.push(
				...Stat.setDamage(victim, victimDamage, victimDamageType),
				...Stat.setDamage(killer, killerDamage, DamageType.Death),
				...cutActions
			);
		} else {
			killerPoints = Snakes.toArray(killer);
			killerDamage = killerPoints.length;

			actions.push(...Stat.setDamage(killer, killerDamage, DamageType.Death));
		}

		Coins.setDeathCoins(killerPoints, killer);
		Coins.setDeathCoins(victimPoints, victim);

		return {
			result,
			actions
		};
	};

	private checkHits = (): ResultWitActions<Player | undefined> => {
		const bullets = state.get<BulletsStore>().bullets;

		for (let i = 0; i < bullets.length; i++) {
			const bullet = bullets[i];
			const { player: killer, point: bulletPoint } = bullet;
			const snakeShotResult = Snakes.checkCollisions(bulletPoint);

			if (!snakeShotResult) {
				continue;
			}

			const { id: victim } = snakeShotResult;
			const {
				result: { points, isDead, isHeadShot },
				actions: hitActions
			} = Snakes.hit(snakeShotResult);
			const damageType = isHeadShot ? DamageType.HeadShot : isDead ? DamageType.Death : DamageType.Standard;

			Stat.setAward(killer, damageType);
			Coins.setDeathCoins(points, victim);
			state.dispatch(
				...Bullets.remove(bullet),
				...hitActions,
				...Stat.setDamage(victim, points.length, damageType)
			);

			if (isDead) {
				const player = snakeShotResult.id;
				return { result: player, actions: [StatActions.decLives(player)] };
			}
		}

		return { result: undefined, actions: [] };
	};

	private getState = (): ArenaState => state.get<ArenaStore>().arena;

	private respawn = (...ids: Player[]): void => {
		Snakes.remove(ids);

		this.callIfInProgress(
			DelayedTasks.delay as someFunc,
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

				Snakes.init(snakesInitial);
			},
			RESPAWN_SNAKE_DELAY
		);
	};
}
