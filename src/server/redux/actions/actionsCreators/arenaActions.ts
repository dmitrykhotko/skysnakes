import { GameStatus } from '../../../../common/enums';
import { Coin, Id, Size } from '../../../../common/types';
import { ActionType } from '../actionType';
import { SetActions } from './setActions';

export abstract class ArenaActions extends SetActions {
	static setSize = super.setValue<Size>(ActionType.SET_SIZE);
	static setCoin = super.setValue<Coin>(ActionType.SET_COIN);
	static flushCoinsBuffer = super.set(ActionType.FLUSH_COINS_BUFFER);
	static removeCoin = super.setValue<Id>(ActionType.REMOVE_COIN);
	static setGameStatus = super.setValue<GameStatus>(ActionType.SET_GAME_STATUS);
}
