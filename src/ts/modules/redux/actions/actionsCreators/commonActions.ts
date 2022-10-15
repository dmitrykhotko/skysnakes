import { GAME_RESET } from '../../../../utils/constants';
import { SetActions } from './setActions';

export abstract class CommonActions extends SetActions {
	static resetGame = super.set(GAME_RESET);
}
