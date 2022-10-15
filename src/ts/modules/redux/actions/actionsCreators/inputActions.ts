import { SET_INPUT, GAME_PAUSE, GAME_START } from '../../../../utils/constants';
import { ControlInput } from '../../../../utils/enums';
import { PlayerInput } from '../../../../utils/types';
import { SetActions } from './setActions';

export abstract class InputActions extends SetActions {
	static setInput = super.setValue<PlayerInput>(SET_INPUT);
	static gameStart = super.setStaticValue(GAME_START, ControlInput.Start);
	static gamePause = super.setStaticValue(GAME_PAUSE, ControlInput.Pause);
}
