import { FIRE, REMOVE_BULLET, RESET_SHOOTING, SET_BULLET } from '../../../../utils/constants';
import { ActionInput } from '../../../../utils/enums';
import { Bullet, Id } from '../../../../utils/types';
import { SetActions } from './setActions';

export abstract class ShootingActions extends SetActions {
	static fire = super.setValue<ActionInput>(FIRE);
	static setBullet = super.setValue<Bullet>(SET_BULLET);
	static removeBullet = super.setValue<Id>(REMOVE_BULLET);
	static reset = super.set(RESET_SHOOTING);
}
