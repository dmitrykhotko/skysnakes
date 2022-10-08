import { BODY_PART_WEIGHT, HEAD_SHOT_WEIGHT } from '../../../utils/constants';
import { nextPointCreator } from '../../../utils/helpers';
import { Bullet, PointWithId, Point, ResultWitActions } from '../../../utils/types';
import { Action, ArenaActions, ShootingActions, ShootingStore, SnakesActions, state } from '../../redux';

export abstract class BulletsManager {
	static move = (): void => {
		const bullets = Object.values(state.get<ShootingStore>().shooting.bullets);
		const actions = [] as Action[];

		for (let i = 0; i < bullets.length; i++) {
			const { id, point, direction } = bullets[i];
			const nextPoint = nextPointCreator[direction](point);

			point.prev = undefined;
			nextPoint.prev = point;

			actions.push(
				ShootingActions.setBullet({ id, point: nextPoint, direction }),
				ArenaActions.moveToBin([point])
			);
		}

		state.dispatch(...actions);
	};

	static removeBullet = (bullet: Bullet): Action[] => {
		const { id, point } = bullet;
		const bin = [point];

		point.prev && bin.push(point.prev);

		return [ShootingActions.removeBullet(id), ArenaActions.moveToBin(bin)];
	};

	static hit = (bullet: Bullet, snakeShotResult: PointWithId): ResultWitActions => {
		const { id: snakeId, point: snakePoint } = snakeShotResult;
		const bin = [] as Point[];
		const actions = [...BulletsManager.removeBullet(bullet)] as Action[];
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
		actions.push(SnakesActions.setTail(nextTail, snakeId));
		isDead && actions.push(SnakesActions.setHead(nextTail, snakeId));

		const coinValue = isHeadShot ? HEAD_SHOT_WEIGHT : bin.length * BODY_PART_WEIGHT;

		actions.push(ArenaActions.setCoins(-coinValue, snakeId), ArenaActions.moveToBin(bin));

		return {
			result: isDead,
			actions
		};
	};
}
