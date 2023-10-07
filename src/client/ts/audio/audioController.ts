import { AudioNotifType } from '../../../common/enums';
import { NotifSlim } from '../../../common/types';
import { Audio } from './audio';
import { SoundLib } from './soundLibrary';

export class AudioController {
    private static typeToPath = {
        [AudioNotifType.Coin]: SoundLib.coin,
        [AudioNotifType.HitSnake]: SoundLib.hitSnake,
        [AudioNotifType.Shoot]: SoundLib.shoot,
        [AudioNotifType.ShootSnake]: SoundLib.shootSnake,
        [AudioNotifType.ShootCoin]: SoundLib.shootCoin
    };

    private audio = new Audio();

    bMOnOff = (): Promise<boolean> => {
        return this.audio.bMOnOff();
    };

    playNotif = (notif: NotifSlim): void => {
        const [type] = notif;
        void this.audio.play(AudioController.typeToPath[type as AudioNotifType]);
    };
}
