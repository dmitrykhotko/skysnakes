import { AudioNotif, Id, NotifsState, ObjectWithId, VisualNotif } from '../../../../common/types';
import { Hlp } from '../../../utils/hlp';
import { Action, SetValueAction } from '../../actions';
import { ActionType } from '../../actions/actionType';
import { Store } from '../../state';
import { Reducer } from '../reducer';

export type NotifsStore = {
	notifs: NotifsState;
};

export abstract class NotifsReducer extends Reducer<NotifsStore> {
	private static initialState = {
		notifs: {}
	} as NotifsStore;

	static getInitialState = (): NotifsStore => this.initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;
		const store = state as NotifsStore;

		switch (type) {
			case ActionType.ADD_AUDIO_NOTIF:
				return this.addNotif(store, 'audio', (action as SetValueAction<AudioNotif>).value);
			case ActionType.REMOVE_AUDIO_NOTIF:
				return this.removeNotif(store, 'audio', (action as SetValueAction<Id>).value);
			case ActionType.CLEAR_AUDIO_NOTIFS:
				return this.clearNotifs(store, 'audio');
			case ActionType.ADD_VISUAL_NOTIF:
				return this.addNotif(store, 'visual', (action as SetValueAction<AudioNotif>).value);
			case ActionType.REMOVE_VISUAL_NOTIF:
				return this.removeNotif(store, 'visual', (action as SetValueAction<Id>).value);
			case ActionType.CLEAR_VISUAL_NOTIFS:
				return this.clearNotifs(store, 'visual');
			case ActionType.CLEAR_NOTIFS:
				return this.clearNotifs(store);
			case ActionType.GAME_RESET:
				return {
					...state,
					...this.initialState
				};
			default:
				return state;
		}
	};

	private static addNotif = <T extends VisualNotif | AudioNotif>(
		store: NotifsStore,
		type: keyof NotifsState,
		notif: T
	): Store => {
		const { notifs } = store;
		const target = notifs[type];

		return {
			...store,
			notifs: {
				...notifs,
				[type]: [...(target ?? []), notif]
			}
		};
	};

	private static removeNotif = (store: NotifsStore, type: keyof NotifsState, id: Id): Store => {
		const { notifs } = store;
		const target = notifs[type];

		if (!target) {
			return store;
		}

		const res = Hlp.excludeById<ObjectWithId>(target, id);

		return {
			...store,
			notifs: {
				...notifs,
				[type]: res.length ? res : undefined
			}
		};
	};

	private static clearNotifs = (store: NotifsStore, type?: keyof NotifsState): Store => {
		const { notifs } = store;

		return {
			...store,
			notifs: type
				? {
						...notifs,
						[type]: undefined
				  }
				: {}
		};
	};
}
