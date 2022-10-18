import { INC_SCORE, DEC_LIVES, SET_WINNERS, SET_SCORE, ADD_SCORE } from '../../../../utils/constants';
import { Player } from '../../../../utils/enums';
import { PlayerStat } from '../../../../utils/types';
import { SetActions } from './setActions';

export abstract class StatActions extends SetActions {
	static incScore = super.setValue<Player>(INC_SCORE);
	static addScore = super.setValueById<number, Player>(ADD_SCORE);
	static setWinners = super.setValue<Player[]>(SET_WINNERS);
	static setScore = super.setValue<PlayerStat[]>(SET_SCORE);
	static decLives = super.setValue<Player>(DEC_LIVES);
}
