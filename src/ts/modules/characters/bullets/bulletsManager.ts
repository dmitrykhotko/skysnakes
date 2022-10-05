import { nextPoint } from '../../../utils/helpers';
import { ShootingActions, ShootingStore, state } from '../../redux';

export abstract class BulletsManager {
	static move = (): void => {
		const bullets = Object.values((state.get() as ShootingStore).shooting.bullets);

		for (let i = 0; i < bullets.length; i++) {
			const { id, point, direction } = bullets[i];

			ShootingActions.setBullet({ id, point: nextPoint[direction](point), direction });
		}
	};
}
