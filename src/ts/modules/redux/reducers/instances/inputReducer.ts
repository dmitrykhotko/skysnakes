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

export abstract class InputReducer extends Reducer<InputStore> {
	private static initialState = {
		input: {
			playerInput: MoveInput.RRight,
			controlInput: ControlInput.Empty
		}
	} as InputStore;

	static getInitialState = (): InputStore => this.initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;
		const buildPlayerInputState = (pName: keyof InputState): Store =>
			setValue(state as InputStore, action, 'input', pName);

		switch (type) {
			case SET_INPUT:
				return buildPlayerInputState('playerInput');
			case SET_START:
			case SET_RESET:
				return this.startReset(state, action);
			case RESET_GAME:
				return { ...state, ...this.initialState };
			default:
				return state;
		}
	};

	private static startReset = (state: Store, action: Action): Store => {
		return {
			...state,
			input: {
				moveInput: this.initialState.input.playerInput,
				controlInput: (action as SetValueAction<ControlInput>).value
			}
		};
	};
}
