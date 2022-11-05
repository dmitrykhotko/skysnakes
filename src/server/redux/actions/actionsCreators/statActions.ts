import { Player } from '../../../../common/enums';
import { Id, Notification } from '../../../../common/types';
import {
	ADD_NOTIFICATION,
	CHANGE_SCORE,
	DEC_LIVES,
	REMOVE_NOTIFICATION,
	RESET_SCORE,
	SET_WINNERS
} from '../../../utils/constants';
import { SetActions } from './setActions';

export abstract class StatActions extends SetActions {
	static changeScore = super.setValueById<number, Player>(CHANGE_SCORE);
	static setWinners = super.setValue<Player[]>(SET_WINNERS);
	static resetStat = super.setValue<{ ids: Player[]; lives: number }>(RESET_SCORE);
	static decLives = super.setValue<Player>(DEC_LIVES);
	static addNotification = super.setValue<Notification>(ADD_NOTIFICATION);
	static removeNotification = super.setValue<Id>(REMOVE_NOTIFICATION);
}
