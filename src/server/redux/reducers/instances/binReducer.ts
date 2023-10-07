import { Action, SetValueAction } from '../../actions';
import { Point } from '../../../../common/types';
import { Hlp } from '../../../utils/hlp';
import { ActionType } from '../../actions/actionType';
import { Store } from '../../state';
import { Reducer } from '../reducer';

export type BinState = Point[];

export type BinStore = {
    bin: BinState;
};

export abstract class BinReducer extends Reducer<BinStore> {
    private static initialState = {
        bin: []
    } as BinStore;

    static getInitialState = (): BinStore => this.initialState;

    static reduce = (state: Store, action: Action): Store => {
        const { type } = action;
        const binStore = state as BinStore;

        let bin: BinState;

        switch (type) {
            case ActionType.MOVE_TO_BIN:
                const points = Hlp.lPointsToPoints((action as SetValueAction<Point[]>).value);

                bin = [...binStore.bin, ...points];
                break;
            case ActionType.EMPTY_BIN:
                bin = [];
                break;
            default:
                return state;
        }

        return {
            ...state,
            bin
        };
    };
}
