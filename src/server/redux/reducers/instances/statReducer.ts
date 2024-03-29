import { CmHlp } from '../../../../common/cmHlp';
import { Player } from '../../../../common/enums';
import { PlayerStat, StatState } from '../../../../common/types';
import { Hlp } from '../../../utils/hlp';
import { InitialData } from '../../../utils/types';
import { Action, SetValueAction, SetValueByIdAction } from '../../actions';
import { ActionType } from '../../actions/actionType';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { setValue } from '../utils';

export type StatStore = {
    stat: StatState;
};

export abstract class StatReducer extends Reducer<StatStore> {
    private static initialState = {
        stat: {}
    } as StatStore;

    static getInitialState = (): StatStore => this.initialState;

    static reduce = (state: Store, action: Action): Store => {
        const { type } = action;
        const statStore = state as StatStore;

        switch (type) {
            case ActionType.SET_WINNERS:
                return setValue(statStore, action, 'stat', 'winners');
            case ActionType.RESET_SCORE:
                return {
                    ...state,
                    stat: {
                        ...statStore.stat,
                        playersStat: (action as SetValueAction<PlayerStat[]>).value
                    }
                };
            case ActionType.CHANGE_SCORE:
                const { id, value } = action as SetValueByIdAction<number, Player>;
                return this.changeStat(statStore, id, 'score', value);
            case ActionType.DEC_LIVES:
                return this.changeStat(statStore, (action as SetValueAction<Player>).value, 'lives', -1);
            case ActionType.GAME_RESET:
                const { players, lives } = (action as SetValueAction<InitialData>).value;
                return {
                    ...state,
                    stat: {
                        playersStat: players.map(({ id }) => ({ id, lives, score: 0 }))
                    }
                };
            default:
                return state;
        }
    };

    private static changeStat = (store: StatStore, id: Player, propName: keyof PlayerStat, value = 1): Store => {
        const { stat } = store;
        const { playersStat } = stat;
        const targetStat = CmHlp.getById(id, playersStat);

        if (!targetStat) {
            return store;
        }

        const newPlayerStatItem = { ...targetStat, [propName]: targetStat[propName] + value };
        const newPlayerStat = [...Hlp.excludeById(playersStat, id), newPlayerStatItem].sort((p1, p2) => p1.id - p2.id);

        return {
            ...store,
            stat: {
                ...stat,
                playersStat: newPlayerStat
            }
        };
    };
}
