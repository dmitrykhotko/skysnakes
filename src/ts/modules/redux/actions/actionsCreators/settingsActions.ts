import { SET_ARENA_TYPE, SET_DEATHS_NUM, SET_DRAW_GRID, SET_PLAYER_MODE } from '../../../../utils/constants';
import { ArenaType, DrawGrid, PlayerMode } from '../../../../utils/enums';
import { SetActions } from './setActions';

export abstract class SettingsActions extends SetActions {
	static setPlayerMode = super.setValue<PlayerMode>(SET_PLAYER_MODE);
	static setArenaType = super.setValue<ArenaType>(SET_ARENA_TYPE);
	static setDrawGrid = super.setValue<DrawGrid>(SET_DRAW_GRID);
	static setDeathsNum = super.setValue<number>(SET_DEATHS_NUM);
}
