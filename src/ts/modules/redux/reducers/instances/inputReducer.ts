import { Action, SetValueAction } from '../..';
import { GAME_RESET, SET_INPUT, GAME_START, GAME_PAUSE } from '../../../../utils/constants';
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

		switch (type) {
			case SET_INPUT:
				return setValue(state as InputStore, action, 'input', 'playerInput');
			case GAME_PAUSE:
			case GAME_START:
				return {
					...state,
					input: {
						moveInput: this.initialState.input.playerInput,
						controlInput: (action as SetValueAction<ControlInput>).value
					}
				};
			case GAME_RESET:
				return { ...state, ...this.initialState };
			default:
				return state;
		}
	};
}
