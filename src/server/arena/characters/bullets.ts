import { Direction, Player } from '../../../common/enums';
import { Bullet, LinkedPoint } from '../../../common/types';
import { BulletsStore, state } from '../../redux';
import { Action, BinActions, BulletsActions } from '../../redux/actions';
import { Hlp } from '../../utils/hlp';

export abstract class Bullets {
	static move = (): void => {
		const collisionActions = [] as Action[];
		const bullets = state.get<BulletsStore>().bullets;

		for (let i = 0; i < bullets.length; i++) {
			const { id, player, point, direction } = bullets[i];
			const nextPoint = Hlp.nextPoint(point, direction);
			const newBullet = { id, player, point: nextPoint, direction };

			state.dispatch(BulletsActions.setBullet(newBullet), BinActions.moveToBin([point]));
			collisionActions.push(...this.checkCollisions(newBullet));
		}

		state.dispatch(...collisionActions);
	};

	static create = (player: Player, point: LinkedPoint, direction: Direction): void => {
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

		return [BulletsActions.remove(id), BinActions.moveToBin(bin)];
	};

	private static checkCollisions = (bullet: Bullet): Action[] => {
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
