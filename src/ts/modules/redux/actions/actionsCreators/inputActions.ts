import { RELEASE_CONTROL_INPUT, SET_DIRECTION, SET_RESET, SET_START } from '../../../../utils/constants';
import { ControlInput, MoveInput } from '../../../../utils/enums';
import { SetActions } from './setActions';

export abstract class InputActions extends SetActions {
	static setMoveInput = super.setValue<MoveInput>(SET_DIRECTION);
	static setStart = super.setStaticValue(SET_START, ControlInput.Start);
	static setReset = super.setStaticValue(SET_RESET, ControlInput.Reset);
	static releaseControlInput = super.setStaticValue(RELEASE_CONTROL_INPUT, ControlInput.Empty);
}
