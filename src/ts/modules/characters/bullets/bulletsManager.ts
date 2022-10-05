import { nextPointCreator } from '../../../utils/helpers';
import { Action, ShootingActions, ShootingStore, state } from '../../redux';

export abstract class BulletsManager {
	static move = (): void => {
		const bullets = Object.values((state.get() as ShootingStore).shooting.bullets);
		const actions = [] as Action[];

		for (let i = 0; i < bullets.length; i++) {
			const { id, point, direction } = bullets[i];
			const nextPoint = nextPointCreator[direction](point);

			actions.push(ShootingActions.setBullet({ id, point: nextPoint, direction }));
		}

		state.dispatch(...actions);
	};
}
