import { Player } from '../../../../common/enums';
import { Id, Notification } from '../../../../common/types';
import { ActionType } from '../actionType';
import { SetActions } from './setActions';

export abstract class StatActions extends SetActions {
	static changeScore = super.setValueById<number, Player>(ActionType.CHANGE_SCORE);
	static setWinners = super.setValue<Player[]>(ActionType.SET_WINNERS);
	static resetStat = super.setValue<{ ids: Player[]; lives: number }>(ActionType.RESET_SCORE);
	static decLives = super.setValue<Player>(ActionType.DEC_LIVES);
	static addNotification = super.setValue<Notification>(ActionType.ADD_NOTIFICATION);
	static removeNotification = super.setValue<Id>(ActionType.REMOVE_NOTIFICATION);
	static clearNotifications = super.set(ActionType.CLEAR_NOTIFICATIONS);
}
