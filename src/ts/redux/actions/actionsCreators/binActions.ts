import { MOVE_TO_BIN, EMPTY_BIN } from '../../../utils/constants';
import { Point } from '../../../utils/types';
import { SetActions } from './setActions';

export abstract class BinActions extends SetActions {
	static moveToBin = super.setValue<Point[]>(MOVE_TO_BIN);
	static emptyBin = super.set(EMPTY_BIN);
}
