import { SET_COIN, SET_GAME_STATUS } from '../../../../utils/constants';
import { GameStatus } from '../../../../utils/enums';
import { Point } from '../../../../utils/types';
import { SetActions } from './setActions';

export abstract class ArenaActions extends SetActions {
	static setCoin = super.setValue<Point>(SET_COIN);
	static setGameStatus = super.setValue<GameStatus>(SET_GAME_STATUS);
}
