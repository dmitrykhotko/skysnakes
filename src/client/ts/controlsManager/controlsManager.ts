import { Observer } from '../../../common/types';
import { Audio } from '../audio';
import { SOUND_OFF, SOUND_ON } from '../utils/labels';

export class ControlsManager {
	private audio = new Audio();
	private soundOnOffButton: HTMLButtonElement;

	constructor(private onClick?: Observer) {
		this.soundOnOffButton = document.querySelector('.js-Snakes__PlayMusic') as HTMLButtonElement;
		this.init();
	}

	private init = (): void => {
		this.soundOnOffButton.innerHTML = SOUND_OFF;
		this.soundOnOffButton.addEventListener('click', this.onCloseBtnClick);
	};

	private onCloseBtnClick = (): void => {
		void this.audio.playPauseBM().then(() => {
			this.soundOnOffButton.innerHTML = this.audio.isBgMPlaying ? SOUND_ON : SOUND_OFF;
		});

		this.onClick && this.onClick();
	};
}
