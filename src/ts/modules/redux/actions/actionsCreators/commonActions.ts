import { RESET_GAME } from '../../../../utils/constants';
import { SetActions } from './setActions';

export abstract class CommonActions extends SetActions {
	static resetGame = super.set(RESET_GAME);
}
