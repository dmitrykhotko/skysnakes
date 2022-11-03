import { SET_INPUT } from '../../../utils/constants';
import { PlayerInput } from '../../../utils/types';
import { SetActions } from './setActions';

export abstract class InputActions extends SetActions {
	static setInput = super.setValue<PlayerInput>(SET_INPUT);
}
