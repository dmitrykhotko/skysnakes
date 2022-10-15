import {
	SET_ARENA_TYPE,
	SET_LIVES,
	SET_DRAW_GRID,
	SET_PLAYER_MODE,
	LIVES,
	PLAYER_MODE
} from '../../../../utils/constants';
import { Strategy, DrawGrid, PlayerMode } from '../../../../utils/enums';
import { Action } from '../..';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { setValue } from '../utils';

export type SettingsState = {
	playerMode: PlayerMode;
	arenaType: Strategy;
	drawGrid: DrawGrid;
	lives: number;
};

export type SettingsStore = {
	settings: SettingsState;
};

export abstract class SettingsReducer extends Reducer<SettingsStore> {
	private static initialState = {
		settings: {
			playerMode: PLAYER_MODE,
			arenaType: Strategy.Transparent,
			drawGrid: DrawGrid.No,
			lives: LIVES
		}
	} as SettingsStore;

	static getInitialState = (): SettingsStore => this.initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;
		const userSettingsState = state as SettingsStore;

		let propName: string;

		switch (type) {
			case SET_PLAYER_MODE:
				propName = 'playerMode';
				break;
			case SET_ARENA_TYPE:
				propName = 'arenaType';
				break;
			case SET_DRAW_GRID:
				propName = 'drawGrid';
				break;
			case SET_LIVES:
				propName = 'lives';
				break;
			default:
				return state;
		}

		return setValue(userSettingsState, action, 'settings', propName);
	};
}
