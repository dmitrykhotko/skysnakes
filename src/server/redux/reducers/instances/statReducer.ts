import { Player } from '../../../../common/enums';
import { Id, Notification, PlayerStat, StatState } from '../../../../common/types';
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
				return setValue(statStore, action, 'stat', 'w');
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
				return this.changeStat(statStore, id, 's', value);
			case ActionType.DEC_LIVES:
				return this.changeStat(statStore, (action as SetValueAction<Player>).value, 'l', -1);
			case ActionType.ADD_NOTIFICATION:
				return this.addNotification(statStore, (action as SetValueAction<Notification>).value);
			case ActionType.REMOVE_NOTIFICATION:
				return this.removeNotification(statStore, (action as SetValueAction<Id>).value);
			case ActionType.GAME_RESET:
				const { players, lives } = (action as SetValueAction<InitialData>).value;
				const playersStat = players.map(({ id }) => ({ id, l: lives, s: 0 }));

				return {
					...state,
					stat: {
						ps: playersStat
					}
				};
			default:
				return state;
		}
	};

	private static changeStat = (store: StatStore, id: Player, propName: string, value = 1): Store => {
		const { stat } = store;
		const { ps: playersStat } = stat;
		const targetStat = Hlp.getById(id, playersStat);

		if (!targetStat) {
			return store;
		}

		const newPlayerStatItem = { ...targetStat, [propName]: targetStat[propName as keyof PlayerStat] + value };
		const newPlayerStat = [...Hlp.excludeById(playersStat, id), newPlayerStatItem].sort((p1, p2) => p1.id - p2.id);

		return {
			...store,
			stat: {
				...stat,
				ps: newPlayerStat
			}
		};
	};

	private static addNotification = (store: StatStore, notification: Notification): Store => {
		const { stat } = store;

		return {
			...store,
			stat: {
				...stat,
				n: [...(stat.n ?? []), notification]
			}
		};
	};

	private static removeNotification = (store: StatStore, id: Id): Store => {
		const { stat } = store;
		const res = Hlp.excludeById(stat.n ?? [], id);

		return {
			...store,
			stat: {
				...stat,
				n: res.length ? res : undefined
			}
		};
	};
}
