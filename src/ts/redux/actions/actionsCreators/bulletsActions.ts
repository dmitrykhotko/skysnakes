import { REMOVE_BULLET, RESET_BULLETS, SET_BULLET } from '../../../utils/constants';
import { Bullet, Id } from '../../../utils/types';
import { SetActions } from './setActions';

export abstract class BulletsActions extends SetActions {
	static setBullet = super.setValue<Bullet>(SET_BULLET);
	static remove = super.setValue<Id>(REMOVE_BULLET);
	static reset = super.set(RESET_BULLETS);
}
