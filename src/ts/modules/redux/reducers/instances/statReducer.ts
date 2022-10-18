import { SET_SCORE, ADD_SCORE, INC_SCORE, DEC_LIVES, SET_WINNERS } from '../../../../utils/constants';
import { PlayerStat } from '../../../../utils/types';
import { Action, SetValueAction, SetValueByIdAction } from '../..';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { Player } from '../../../../utils/enums';
import { Hlp } from '../../../../utils';
import { setValue } from '../utils';

export type StatState = {
	playersStat: PlayerStat[];
	winners: Player[];
};

export type StatStore = {
	stat: StatState;
};

export abstract class StatReducer extends Reducer<StatStore> {
	private static initialState = {
		stat: {
			playersStat: [],
			winners: []
		}
	} as StatStore;

	static getInitialState = (): StatStore => this.initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;
		const statStore = state as StatStore;

		switch (type) {
			case SET_WINNERS:
				return setValue(statStore, action, 'stat', 'winners');
			case SET_SCORE:
				return {
					...state,
					stat: {
						...statStore.stat,
						playersStat: (action as SetValueAction<PlayerStat[]>).value
					}
				};
			case INC_SCORE:
				return this.changeStat((action as SetValueAction<Player>).value, statStore, 'score');
			case ADD_SCORE:
				const { id, value } = action as SetValueByIdAction<number, Player>;
				return this.changeStat(id, statStore, 'score', value);
			case DEC_LIVES:
				return this.changeStat((action as SetValueAction<Player>).value, statStore, 'lives', -1);
			default:
				return state;
		}
	};

	private static changeStat = (id: Player, store: StatStore, propName: string, value = 1): Store => {
		const { stat } = store;
		const { playersStat } = stat;
		const targetStat = Hlp.getById(id, playersStat);
		const playersStatNew = [
			...Hlp.filterById(id, playersStat),
			{ ...targetStat, [propName]: targetStat[propName as keyof PlayerStat] + value }
		].sort((p1, p2) => p1.id - p2.id);

		if (!targetStat) {
			return store;
		}

		return {
			...store,
			stat: {
				...stat,
				playersStat: playersStatNew
			}
		};
	};
}
