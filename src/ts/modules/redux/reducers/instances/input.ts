import { Action, SetValueAction } from '../..';
import { RELEASE_CONTROL_INPUT, SET_DIRECTION, SET_RESET, SET_START } from '../../../../utils/constants';
import { ControlInput, MoveInput } from '../../../../utils/enums';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { buildState } from '../utils';

export type InputStore = {
	input: {
		moveInput: MoveInput;
		controlInput: ControlInput;
	};
};

const initialState = {
	input: {
		moveInput: MoveInput.RRight,
		controlInput: ControlInput.Empty
	}
} as InputStore;

const startReset = (state: Store, action: Action) => {
	return {
		...state,
		input: {
			moveInput: initialState.input.moveInput,
			controlInput: (action as SetValueAction<ControlInput>).value
		}
	};
};

export abstract class InputReducer extends Reducer<InputStore> {
	static getInitialState = (): InputStore => initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;
		const buildPlayerInputState = (pName: string) => buildState(state as InputStore, action, 'input', pName);

		switch (type) {
			case SET_DIRECTION:
				return buildPlayerInputState('moveInput');
			case SET_START:
			case SET_RESET:
				return startReset(state, action);
			case RELEASE_CONTROL_INPUT:
				return buildPlayerInputState('controlInput');
			default:
				return state;
		}
	};
}
