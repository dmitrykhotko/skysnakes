import { SET_ARENA_TYPE, SET_LIVES, SET_DRAW_GRID, SET_PLAYER_MODE } from '../../../../utils/constants';
import { Strategy, DrawGrid, PlayerMode } from '../../../../utils/enums';
import { SetActions } from './setActions';

export abstract class SettingsActions extends SetActions {
	static setPlayerMode = super.setValue<PlayerMode>(SET_PLAYER_MODE);
	static setArenaType = super.setValue<Strategy>(SET_ARENA_TYPE);
	static setDrawGrid = super.setValue<DrawGrid>(SET_DRAW_GRID);
	static setLives = super.setValue<number>(SET_LIVES);
}
