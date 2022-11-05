import { PlayerInput } from '../../../../common/types';
import { ActionType } from '../actionType';
import { SetActions } from './setActions';

export abstract class InputActions extends SetActions {
	static setInput = super.setValue<PlayerInput>(ActionType.SET_INPUT);
}
