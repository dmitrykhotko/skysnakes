import { InitialData } from '../../../utils/types';
import { ActionType } from '../actionType';
import { SetActions } from './setActions';

export abstract class CommonActions extends SetActions {
    static resetGame = super.setValue<InitialData>(ActionType.GAME_RESET);
    static focusChanged = super.set(ActionType.FOCUS_CHANGED);
}
