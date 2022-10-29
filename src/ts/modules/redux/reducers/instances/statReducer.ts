import {
	RESET_SCORE,
	CHANGE_SCORE,
	DEC_LIVES,
	SET_WINNERS,
	ADD_NOTIFICATION,
	REMOVE_NOTIFICATION,
	GAME_RESET,
	LIVES
} from '../../../../utils/constants';
import { DirectionWithId, Id, Notification, PlayerStat } from '../../../../utils/types';
import { Action, SetValueAction, SetValueByIdAction } from '../..';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { Player } from '../../../../utils/enums';
import { Hlp } from '../../../../utils';
import { setValue } from '../utils';

export type StatState = {
	playersStat: PlayerStat[];
	winners: Player[];
	notifications: Notification[];
};

export type StatStore = {
	stat: StatState;
};

export abstract class StatReducer extends Reducer<StatStore> {
	private static initialState = {
		stat: {
			playersStat: [],
			winners: [],
			notifications: []
		}
	} as StatStore;

	static getInitialState = (): StatStore => this.initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;
		const statStore = state as StatStore;

		switch (type) {
			case SET_WINNERS:
				return setValue(statStore, action, 'stat', 'winners');
			case RESET_SCORE:
				return {
					...state,
					stat: {
						...statStore.stat,
						playersStat: (action as SetValueAction<PlayerStat[]>).value
					}
				};
			case CHANGE_SCORE:
				const { id, value } = action as SetValueByIdAction<number, Player>;
				return this.changeStat(statStore, id, 'score', value);
			case DEC_LIVES:
				return this.changeStat(statStore, (action as SetValueAction<Player>).value, 'lives', -1);
			case ADD_NOTIFICATION:
				return this.addNotification(statStore, (action as SetValueAction<Notification>).value);
			case REMOVE_NOTIFICATION:
				return this.removeNotification(statStore, (action as SetValueAction<Id>).value);
			case GAME_RESET:
				const initialData = (action as SetValueAction<DirectionWithId[]>).value;
				const playersStat = initialData.map(({ id }) => ({ id, lives: LIVES, score: 0 }));

				return {
					...state,
					stat: {
						...statStore.stat,
						playersStat,
						winners: [],
						notifications: []
					}
				};
			default:
				return state;
		}
	};

	private static changeStat = (store: StatStore, id: Player, propName: string, value = 1): Store => {
		const { stat } = store;
		const { playersStat } = stat;
		const targetStat = Hlp.getById(id, playersStat);

		if (!targetStat) {
			return store;
		}

		const newPlayerStatItem = { ...targetStat, [propName]: targetStat[propName as keyof PlayerStat] + value };
		const newPlayerStat = [...Hlp.excludeId(id, playersStat), newPlayerStatItem].sort((p1, p2) => p1.id - p2.id);

		return {
			...store,
			stat: {
				...stat,
				playersStat: newPlayerStat
			}
		};
	};

	private static addNotification = (store: StatStore, notification: Notification): Store => {
		const { stat } = store;

		return {
			...store,
			stat: {
				...stat,
				notifications: [...stat.notifications, notification]
			}
		};
	};

	private static removeNotification = (store: StatStore, id: Id): Store => {
		const { stat } = store;

		return {
			...store,
			stat: {
				...stat,
				notifications: Hlp.excludeId(id, stat.notifications)
			}
		};
	};
}
