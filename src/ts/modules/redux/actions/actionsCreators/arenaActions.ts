import { SET_COIN, SET_IN_PROGRESS } from '../../../../utils/constants';
import { Point } from '../../../../utils/types';
import { SetActions } from './setActions';

export abstract class ArenaActions extends SetActions {
	static setCoin = super.setValue<Point>(SET_COIN);
	static setInProgress = super.setValue<boolean>(SET_IN_PROGRESS);
}
