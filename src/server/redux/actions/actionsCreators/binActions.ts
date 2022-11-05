import { Point } from '../../../../common/types';
import { EMPTY_BIN, MOVE_TO_BIN } from '../../../utils/constants';
import { SetActions } from './setActions';

export abstract class BinActions extends SetActions {
	static moveToBin = super.setValue<Point[]>(MOVE_TO_BIN);
	static emptyBin = super.set(EMPTY_BIN);
}
