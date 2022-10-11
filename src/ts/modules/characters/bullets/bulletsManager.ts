import { BODY_PART_WEIGHT, FRIENDLY_FIRE_WEIGHT, HEAD_SHOT_AWARD, KILL_AWARD } from '../../../utils/constants';
import { Hlp } from '../../../utils';
import { Bullet, PointWithId, Point } from '../../../utils/types';
import { Action, ArenaActions, BinActions, BulletsActions, BulletsStore, SnakesActions, state } from '../../redux';

export abstract class BulletsManager {
	static move = (): void => {
		const collisionActions = [] as Action[];
		const bullets = state.get<BulletsStore>().bullets;

		for (let i = 0; i < bullets.length; i++) {
			const { id, playerId, point, direction } = bullets[i];
			const nextPoint = Hlp.nextPoint(point, direction);

			point.prev = undefined;
			nextPoint.prev = point;

			const newBullet = { id, playerId, point: nextPoint, direction };

			state.dispatch(BulletsActions.setBullet(newBullet), BinActions.moveToBin([point]));
			collisionActions.push(...this.checkCollision(newBullet));
		}

		state.dispatch(...collisionActions);
	};

	static removeBullet = (bullet: Bullet): Action[] => {
		const { id, point } = bullet;
		const bin = [point];

		point.prev && bin.push(point.prev);

		return [BulletsActions.removeBullet(id), BinActions.moveToBin(bin)];
	};

	static hit = (bullet: Bullet, snakeShotResult: PointWithId): boolean => {
		const { id: victim, point: snakePoint } = snakeShotResult;
		const { playerId: shooter } = bullet;
		const bin = [] as Point[];
		const actions = [...this.removeBullet(bullet)] as Action[];
		const nextPoint = snakePoint.next;
		const isHeadShot = !nextPoint;
		const isDead = isHeadShot || !nextPoint.next; // it's either head shot or shot the last body piece
		const nextTail = nextPoint || snakePoint;

		let trashPoint: Point | undefined = snakePoint;

		while (trashPoint) {
			bin.push(trashPoint);
			trashPoint = trashPoint.prev;
		}

		nextTail.prev = undefined;
		actions.push(SnakesActions.setTail(nextTail, victim));
		isDead && actions.push(SnakesActions.setHead(nextTail, victim));

		const bodyFactor = BODY_PART_WEIGHT * (victim === shooter ? -FRIENDLY_FIRE_WEIGHT : 1);
		let scoreDelta: number;

		if (isHeadShot) {
			scoreDelta = HEAD_SHOT_AWARD;
		} else {
			scoreDelta = Math.ceil(bin.length * bodyFactor);

			if (isDead) {
				scoreDelta += KILL_AWARD;
			}
		}

		state.dispatch(...actions, ArenaActions.addCoins(scoreDelta, shooter), BinActions.moveToBin(bin));

		return isDead;
	};

	static getBulletsSet = (width: number): Set<number> => {
		const set: Set<number> = new Set<number>();
		const bullets = state.get<BulletsStore>().bullets;

		for (let i = 0; i < bullets.length; i++) {
			const { point } = bullets[i];
			set.add(point.x + point.y * width);
		}

		return set;
	};

	private static checkCollision = (bullet: Bullet): Action[] => {
		const {
			id,
			point: { x, y }
		} = bullet;
		const actions = [] as Action[];
		const bullets = state.get<BulletsStore>().bullets;
		let result = false;

		for (let i = 0; i < bullets.length; i++) {
			const currBullet = bullets[i];
			const {
				id: currId,
				point: { x: currX, y: currY }
			} = bullets[i];

			if (id === currId || !(x === currX && y === currY)) {
				continue;
			}

			if (!result) {
				actions.push(...this.removeBullet(bullet));
				result = true;
			}

			actions.push(...this.removeBullet(currBullet));
		}

		return actions;
	};
}
