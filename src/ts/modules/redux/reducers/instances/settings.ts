import { SET_ARENA_TYPE, SET_LIVES, SET_DRAW_GRID, SET_PLAYER_MODE, LIVES } from '../../../../utils/constants';
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

const initialState = {
	settings: {
		playerMode: PlayerMode.Multiplayer,
		arenaType: Strategy.Transparent,
		drawGrid: DrawGrid.No,
		lives: LIVES
	}
} as SettingsStore;

export abstract class SettingsReducer extends Reducer<SettingsStore> {
	static getInitialState = (): SettingsStore => initialState;

	static reduce = (state: Store, action: Action): Store => {
		let propName: string;

		const { type } = action;
		const userSettingsState = state as SettingsStore;

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
