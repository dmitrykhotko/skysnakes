import { SET_ARENA_TYPE, SET_DEATHS_NUM, SET_DRAW_GRID, SET_PLAYER_MODE } from '../../../../utils/constants';
import { ArenaType, DrawGrid, PlayerMode } from '../../../../utils/enums';
import { Action } from '../..';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { setValue } from '../utils';

export type SettingsState = {
	playerMode: PlayerMode;
	arenaType: ArenaType;
	drawGrid: DrawGrid;
	deathsNum: number;
};

export type SettingsStore = {
	settings: SettingsState;
};

const initialState = {
	settings: {
		playerMode: PlayerMode.SinglePlayer,
		arenaType: ArenaType.Transparent,
		drawGrid: DrawGrid.No,
		deathsNum: 2
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
			case SET_DEATHS_NUM:
				propName = 'deathsNum';
				break;
			default:
				return state;
		}

		return setValue(userSettingsState, action, 'settings', propName);
	};
}
