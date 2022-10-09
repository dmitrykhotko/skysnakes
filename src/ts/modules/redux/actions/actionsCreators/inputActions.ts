import { SET_INPUT, SET_RESET, SET_START } from '../../../../utils/constants';
import { ControlInput } from '../../../../utils/enums';
import { PlayerInput } from '../../../../utils/types';
import { SetActions } from './setActions';

export abstract class InputActions extends SetActions {
	static setInput = super.setValue<PlayerInput>(SET_INPUT);
	static setStart = super.setStaticValue(SET_START, ControlInput.Start);
	static setReset = super.setStaticValue(SET_RESET, ControlInput.Reset);
}
