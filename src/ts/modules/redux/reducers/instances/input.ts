import { Action, SetValueAction } from '../..';
import { RESET_GAME, SET_INPUT, SET_RESET, SET_START } from '../../../../utils/constants';
import { ControlInput, MoveInput } from '../../../../utils/enums';
import { PlayerInput } from '../../../../utils/types';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { setValue } from '../utils';

export type InputState = {
	playerInput: PlayerInput;
	controlInput: ControlInput;
};

export type InputStore = {
	input: InputState;
};

const initialState = {
	input: {
		playerInput: MoveInput.RRight,
		controlInput: ControlInput.Empty
	}
} as InputStore;

const startReset = (state: Store, action: Action): Store => {
	return {
		...state,
		input: {
			moveInput: initialState.input.playerInput,
			controlInput: (action as SetValueAction<ControlInput>).value
		}
	};
};

export abstract class InputReducer extends Reducer<InputStore> {
	static getInitialState = (): InputStore => initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;
		const buildPlayerInputState = (pName: keyof InputState): Store =>
			setValue(state as InputStore, action, 'input', pName);

		switch (type) {
			case SET_INPUT:
				return buildPlayerInputState('playerInput');
			case SET_START:
			case SET_RESET:
				return startReset(state, action);
			case RESET_GAME:
				return { ...state, ...initialState };
			default:
				return state;
		}
	};
}
