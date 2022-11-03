import {
	DEC_LIVES,
	SET_WINNERS,
	RESET_SCORE,
	CHANGE_SCORE,
	ADD_NOTIFICATION,
	REMOVE_NOTIFICATION
} from '../../../utils/constants';
import { Player } from '../../../utils/enums';
import { Id, Notification } from '../../../utils/types';
import { SetActions } from './setActions';

export abstract class StatActions extends SetActions {
	static changeScore = super.setValueById<number, Player>(CHANGE_SCORE);
	static setWinners = super.setValue<Player[]>(SET_WINNERS);
	static resetStat = super.setValue<{ ids: Player[]; lives: number }>(RESET_SCORE);
	static decLives = super.setValue<Player>(DEC_LIVES);
	static addNotification = super.setValue<Notification>(ADD_NOTIFICATION);
	static removeNotification = super.setValue<Id>(REMOVE_NOTIFICATION);
}
