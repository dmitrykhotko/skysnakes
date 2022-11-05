import { GameStatus } from '../../../../common/enums';
import { Coin, Id, Size } from '../../../../common/types';
import { FLUSH_COINS_BUFFER, REMOVE_COIN, SET_COIN, SET_GAME_STATUS, SET_SIZE } from '../../../utils/constants';
import { SetActions } from './setActions';

export abstract class ArenaActions extends SetActions {
	static setSize = super.setValue<Size>(SET_SIZE);
	static setCoin = super.setValue<Coin>(SET_COIN);
	static flushCoinsBuffer = super.set(FLUSH_COINS_BUFFER);
	static removeCoin = super.setValue<Id>(REMOVE_COIN);
	static setGameStatus = super.setValue<GameStatus>(SET_GAME_STATUS);
}
