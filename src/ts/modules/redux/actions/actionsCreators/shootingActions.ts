import { FIRE, SET_BULLET } from '../../../../utils/constants';
import { ActionInput } from '../../../../utils/enums';
import { Bullet } from '../../../../utils/types';
import { SetActions } from './setActions';

export abstract class ShootingActions extends SetActions {
	static fire = super.setValue<ActionInput>(FIRE);
	static setBullet = super.setValue<Bullet>(SET_BULLET);
}
