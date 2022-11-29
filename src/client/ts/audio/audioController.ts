import { AudioNotifType } from '../../../common/enums';
import { NotificationSlim } from '../../../common/types';
import { Audio } from './audio';
import { SoundLib } from './soundLibrary';

export class AudioController {
	private static typeToPath = {
		[AudioNotifType.Shoot]: SoundLib.shoot,
		[AudioNotifType.Coin]: SoundLib.coin
	};

	private audio = new Audio();

	bMOnOff = (): Promise<boolean> => {
		return this.audio.bMOnOff();
	};

	playNotif = (notif: NotificationSlim): void => {
		const [type] = notif;
		void this.audio.play(AudioController.typeToPath[type as AudioNotifType]);
	};
}
