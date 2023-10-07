import { Point } from '../../../../common/types';
import { ActionType } from '../actionType';
import { SetActions } from './setActions';

export abstract class BinActions extends SetActions {
    static moveToBin = super.setValue<Point[]>(ActionType.MOVE_TO_BIN);
    static emptyBin = super.set(ActionType.EMPTY_BIN);
}
