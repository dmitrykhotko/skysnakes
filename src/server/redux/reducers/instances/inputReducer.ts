import { Action } from '../..';
import { MoveInput } from '../../../../common/enums';
import { PlayerInput } from '../../../../common/types';
import { ActionType } from '../../actions/actionType';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { setValue } from '../utils';

export type InputState = {
	playerInput: PlayerInput;
};

export type InputStore = {
	input: InputState;
};

export abstract class InputReducer extends Reducer<InputStore> {
	private static initialState = {
		input: {
			playerInput: MoveInput.RRight
		}
	} as InputStore;

	static getInitialState = (): InputStore => this.initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;

		switch (type) {
			case ActionType.SET_INPUT:
				return setValue(state as InputStore, action, 'input', 'playerInput');
			case ActionType.GAME_RESET:
				return { ...state, ...this.initialState };
			default:
				return state;
		}
	};
}
