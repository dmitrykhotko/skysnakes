import { Hlp } from '../../../utils';
import { Direction, Player } from '../../../utils/enums';
import { Bullet, Point } from '../../../utils/types';
import { Action, BinActions, BulletsActions, BulletsStore, state } from '../../redux';

export abstract class Bullets {
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

	static create = (player: Player, point: Point, direction: Direction): void => {
		state.dispatch(
			BulletsActions.setBullet({
				id: Hlp.generateId(),
				player,
				point,
				direction
			})
		);
	};

	static remove = (bullet: Bullet): Action[] => {
		const { id, point } = bullet;
		const bin = [point];

		point.prev && bin.push(point.prev);

		return [BulletsActions.remove(id), BinActions.moveToBin(bin)];
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
				actions.push(...this.remove(bullet));
				result = true;
			}

			actions.push(...this.remove(currBullet));
		}

		return actions;
	};
}
