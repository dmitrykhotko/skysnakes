import {
	INC_SCORE,
	DEC_LIVES,
	SET_COIN,
	SET_IN_PROGRESS,
	SET_WINNERS,
	SET_SCORE,
	ADD_SCORE
} from '../../../../utils/constants';
import { Player } from '../../../../utils/enums';
import { Point, PlayersStat } from '../../../../utils/types';
import { SetActions } from './setActions';

export abstract class ArenaActions extends SetActions {
	static setCoin = super.setValue<Point>(SET_COIN);
	static incScore = super.setValue<Player>(INC_SCORE);
	static addScore = super.setValueById<number, Player>(ADD_SCORE);
	static setInProgress = super.setValue<boolean>(SET_IN_PROGRESS);
	static setWinners = super.setValue<Player[]>(SET_WINNERS);
	static setScore = super.setValue<PlayersStat[]>(SET_SCORE);
	static decLives = super.setValue<Player>(DEC_LIVES);
}
