import { AudioNotif, Id, VisualNotif } from '../../../../common/types';
import { ActionType } from '../actionType';
import { SetActions } from './setActions';

export abstract class NotifsActions extends SetActions {
	static addAudioNotif = super.setValue<AudioNotif>(ActionType.ADD_AUDIO_NOTIF);
	static removeAudioNotif = super.setValue<Id>(ActionType.REMOVE_AUDIO_NOTIF);
	static clearAudioNotifs = super.set(ActionType.CLEAR_AUDIO_NOTIFS);
	static addVisualNotif = super.setValue<VisualNotif>(ActionType.ADD_VISUAL_NOTIF);
	static removeVisualNotif = super.setValue<Id>(ActionType.REMOVE_VISUAL_NOTIF);
	static clearVisualNotifs = super.set(ActionType.CLEAR_VISUAL_NOTIFS);
	static clearNotifs = super.set(ActionType.CLEAR_NOTIFS);
}
