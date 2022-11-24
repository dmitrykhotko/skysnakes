import { GameStatus, Player } from '../../common/enums';
import { Id, LinkedPoint, Size } from '../../common/types';
import { ArenaState, ArenaStore, BulletsStore } from '../redux';
import { Action, SnakesActions, StatActions } from '../redux/actions';
import { State } from '../redux/state';
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

	private snakes: Snakes;
	private coins: Coins;
	private bullets: Bullets;
	private stat: Stat;

	constructor(private state: State) {
		this.stepsNum = Hlp.lcm(SNAKE_SPEED, BULLET_SPEED);
		this.snakeStep = this.stepsNum / SNAKE_SPEED;
		this.bulletStep = this.stepsNum / BULLET_SPEED;

		this.snakes = new Snakes(this.state);
		this.coins = new Coins(this.state);
		this.bullets = new Bullets(this.state);
		this.stat = new Stat(this.state);
	}

	start = (snakesInitial: DirectionWithId[]): void => {
		this.steps = 0;
		this.snakesInitial = snakesInitial;

		this.snakes.init(this.snakesInitial);
		this.coins.init();
	};

	tick = (): void => {
		this.steps++;

		const moveBullets = !(this.steps % this.bulletStep);
		const moveSnakes = !(this.steps % this.snakeStep);

		moveBullets && this.callIfInProgress(this.moveBullets);
		moveSnakes && this.callIfInProgress(this.moveSnakes);

		this.steps === this.stepsNum && (this.steps = 0);

		this.coins.checkNumber();
	};

	private callIfInProgress = (callMe: someFunc, ...params: unknown[]): unknown => {
		const { status } = this.getState();
		return status === GameStatus.InProgress ? callMe(...params) : undefined;
	};

	private moveBullets = (): void => {
		this.bullets.move();

		const { width, height } = Hlp.getSize(this.state);
		const { result: victim, actions: hitsActions } = this.checkHits();
		const actions = [...hitsActions];
		const bullets = this.state.get<BulletsStore>().bullets;

		for (let i = 0; i < bullets.length; i++) {
			const bullet = bullets[i];
			const { p: point } = bullet;
			const [x, y] = point;
			const faceCoin = !!this.coins.checkCollisions(point).length;
			const facedWall = x > width - 1 || y > height - 1 || x < 0 || y < 0;

			(faceCoin || facedWall) && actions.push(...this.bullets.remove(bullet));
		}

		this.state.dispatch(...actions);
		this.stat.judge();

		victim && this.respawn(victim);
	};

	private checkSnakeGrowth = (id: Player, head: LinkedPoint): number => {
		const facedCoins = this.coins.checkCollisions(head);

		facedCoins.length && this.stat.faceCoins(id, facedCoins);
		return facedCoins.length;
	};

	private moveSnakes = (): void => {
		const snakes = this.snakes.get();
		const actions = [] as Action[];
		const victims = [];

		for (let i = 0; i < snakes.length; i++) {
			const { id } = snakes[i];

			this.snakes.move(id, this.checkSnakeGrowth);

			const { head } = this.snakes.getById(id);
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

			actions.push(...this.checkWalls(head, id, Hlp.getSize(this.state)));
		}

		this.state.dispatch(...actions);

		const { result: victim, actions: hitsActions } = this.checkHits();

		this.state.dispatch(...hitsActions);
		this.stat.judge();

		victim && victims.push(victim);
		victims.length && this.respawn(...victims);
	};

	private checkWalls = (head: LinkedPoint, id: Player, { width, height }: Size): Action[] => {
		const actions = [] as Action[];
		let [headX, headY] = head;

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

		const newHead = [headX, headY] as LinkedPoint;

		newHead.prev = head.prev;

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
		const facedSnake = this.snakes.checkCollisions(head);
		let result = -1;

		if (!facedSnake) {
			return {
				result,
				actions
			};
		}

		const { id: victim, p: facedPoint } = facedSnake;

		let victimDamage = 0;
		let killerDamage = 0;
		let victimPoints = [] as LinkedPoint[];
		let killerPoints = [] as LinkedPoint[];

		if (victim !== killer) {
			const { result: cutPoints, actions: cutActions } = this.snakes.cut({
				id: victim,
				p: facedPoint
			});
			const isVictimDead = Hlp.comparePoints(facedPoint, this.snakes.getById(victim).head);

			let victimDamageType = DamageType.Standard;

			killerPoints = this.snakes.toArray(killer);
			killerDamage = killerPoints.length;

			victimPoints = cutPoints;
			victimDamage = victimPoints.length;

			if (isVictimDead) {
				result = victim;
				victimDamageType = DamageType.Death;
			}

			actions.push(
				...this.stat.setDamage(victim, victimDamage, victimDamageType),
				...this.stat.setDamage(killer, killerDamage, DamageType.Death),
				...cutActions
			);
		} else {
			killerPoints = this.snakes.toArray(killer);
			killerDamage = killerPoints.length;

			actions.push(...this.stat.setDamage(killer, killerDamage, DamageType.Death));
		}

		this.coins.setDeathCoins(killerPoints, killer);
		this.coins.setDeathCoins(victimPoints, victim);

		return {
			result,
			actions
		};
	};

	private checkHits = (): ResultWitActions<Player | undefined> => {
		const bullets = this.state.get<BulletsStore>().bullets;

		for (let i = 0; i < bullets.length; i++) {
			const bullet = bullets[i];
			const { pr: killer, p: bulletPoint } = bullet;
			const snakeShotResult = this.snakes.checkCollisions(bulletPoint);

			if (!snakeShotResult) {
				continue;
			}

			const { id: victim } = snakeShotResult;
			const {
				result: { points, isDead, isHeadShot },
				actions: hitActions
			} = this.snakes.hit(snakeShotResult);
			const damageType = isHeadShot ? DamageType.HeadShot : isDead ? DamageType.Death : DamageType.Standard;

			this.stat.setAward(killer, damageType);
			this.coins.setDeathCoins(points, victim);
			this.state.dispatch(
				...this.bullets.remove(bullet),
				...hitActions,
				...this.stat.setDamage(victim, points.length, damageType)
			);

			if (isDead) {
				const player = snakeShotResult.id;
				return { result: player, actions: [StatActions.decLives(player)] };
			}
		}

		return { result: undefined, actions: [] };
	};

	private getState = (): ArenaState => this.state.get<ArenaStore>().arena;

	private respawn = (...ids: Player[]): void => {
		this.snakes.remove(ids);

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

				this.snakes.init(snakesInitial);
			},
			RESPAWN_SNAKE_DELAY
		);
	};
}
