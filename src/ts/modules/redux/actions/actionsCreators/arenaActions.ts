import { REMOVE_COIN, SET_COIN, SET_GAME_STATUS, SET_SIZE } from '../../../../utils/constants';
import { GameStatus } from '../../../../utils/enums';
import { Coin, Id, Size } from '../../../../utils/types';
import { SetActions } from './setActions';

export abstract class ArenaActions extends SetActions {
	static setSize = super.setValue<Size>(SET_SIZE);
	static setCoin = super.setValue<Coin>(SET_COIN);
	static removeCoin = super.setValue<Id>(REMOVE_COIN);
	static setGameStatus = super.setValue<GameStatus>(SET_GAME_STATUS);
}
