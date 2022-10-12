import { Hlp } from '../../../utils';
import { Bullet } from '../../../utils/types';
import { Action, BinActions, BulletsActions, BulletsStore, state } from '../../redux';

export abstract class BulletsManager {
	static move = (): void => {
		const collisionActions = [] as Action[];
		const bullets = state.get<BulletsStore>().bullets;

		for (let i = 0; i < bullets.length; i++) {
			const { id, player, point, direction } = bullets[i];
			const nextPoint = Hlp.nextPoint(point, direction);

			point.prev = undefined;
			nextPoint.prev = point;

			const newBullet = { id, player, point: nextPoint, direction };

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
