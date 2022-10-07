import {
	MOVE_TO_BIN,
	INC_COINS,
	INC_DEATHS,
	SET_COIN,
	SET_IN_PROGRESS,
	SET_LOOSERS,
	SET_SCORE,
	EMPTY_BIN
} from '../../../../utils/constants';
import { Player } from '../../../../utils/enums';
import { Point, Score } from '../../../../utils/types';
import { SetActions } from './setActions';

export abstract class ArenaActions extends SetActions {
	static setCoin = super.setValue<Point>(SET_COIN);
	static incCoins = super.setValue<Player>(INC_COINS);
	static setInProgress = super.setValue<boolean>(SET_IN_PROGRESS);
	static setLoosers = super.setValue<Player[]>(SET_LOOSERS);
	static setScore = super.setValue<Record<Player, Score>>(SET_SCORE);
	static incDeaths = super.setValue<Player>(INC_DEATHS);
	static moveToBin = super.setValue<Point[]>(MOVE_TO_BIN);
	static emptyBin = super.set(EMPTY_BIN);
}
