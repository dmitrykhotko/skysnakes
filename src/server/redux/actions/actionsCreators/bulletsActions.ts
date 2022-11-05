import { Bullet, Id } from '../../../../common/types';
import { ActionType } from '../actionType';
import { SetActions } from './setActions';

export abstract class BulletsActions extends SetActions {
	static setBullet = super.setValue<Bullet>(ActionType.SET_BULLET);
	static remove = super.setValue<Id>(ActionType.REMOVE_BULLET);
	static reset = super.set(ActionType.RESET_BULLETS);
}
