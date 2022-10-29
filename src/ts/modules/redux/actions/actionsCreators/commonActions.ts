import { GAME_RESET } from '../../../../utils/constants';
import { DirectionWithId } from '../../../../utils/types';
import { SetActions } from './setActions';

export abstract class CommonActions extends SetActions {
	static resetGame = super.setValue<DirectionWithId[]>(GAME_RESET);
}
