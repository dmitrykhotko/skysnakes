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

			actions.push(ShootingActions.setBullet({ id, point: nextPoint, direction }));
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
		const nextTail = snakePoint.next;
		const isDead = !(nextTail && nextTail.next); // it's either head shot or shot the last body piece

		if (isDead) {
			return {
				result: true,
				actions: []
			};
		}

		const bin = [] as Point[];
		const actions = [...BulletsManager.removeBullet(bullet)] as Action[];

		let trashPoint: Point | undefined = nextTail;

		actions.push(SnakesActions.setTail({ ...nextTail, ...{ prev: undefined } }, snakeId));

		while (trashPoint) {
			bin.push(trashPoint);
			trashPoint = trashPoint.prev;
		}

		actions.push(ArenaActions.moveToBin(bin));

		return {
			result: false,
			actions
		};
	};
}
