import { Action, SetValueAction } from '../..';
import { SET_DIRECTION, SET_RESET, SET_START } from '../../../../utils/constants';
import { ControlInput, MoveInput } from '../../../../utils/enums';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { setValue } from '../utils';

export type InputState = {
	moveInput: MoveInput;
	controlInput: ControlInput;
};

export type InputStore = {
	input: InputState;
};

const initialState = {
	input: {
		moveInput: MoveInput.RRight,
		controlInput: ControlInput.Empty
	}
} as InputStore;

const startReset = (state: Store, action: Action): Store => {
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
		const buildPlayerInputState = (pName: string): Store => setValue(state as InputStore, action, 'input', pName);

		switch (type) {
			case SET_DIRECTION:
				return buildPlayerInputState('moveInput');
			case SET_START:
			case SET_RESET:
				return startReset(state, action);
			default:
				return state;
		}
	};
}
