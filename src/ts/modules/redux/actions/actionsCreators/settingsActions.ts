import { SET_ARENA_TYPE, SET_LIVES, SET_PLAYER_MODE } from '../../../../utils/constants';
import { Strategy, PlayerMode } from '../../../../utils/enums';
import { SetActions } from './setActions';

export abstract class SettingsActions extends SetActions {
	static setPlayerMode = super.setValue<PlayerMode>(SET_PLAYER_MODE);
	static setArenaType = super.setValue<Strategy>(SET_ARENA_TYPE);
	static setLives = super.setValue<number>(SET_LIVES);
}
