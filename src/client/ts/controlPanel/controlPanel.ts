import { Observer } from '../../../common/types';
import { Audio } from '../audio';
import { SOUND_OFF, SOUND_ON } from '../utils/labels';

export class ControlPanel {
	private audio = new Audio();
	private menuBtn: HTMLButtonElement;
	private soundOnOffBtn: HTMLButtonElement;

	constructor(private onBtnClickCb: Observer, private onMenuBtnClickCb: Observer) {
		const el = document.querySelector('.js-Snakes__ControlPanel') as HTMLElement;

		this.menuBtn = el.querySelector('.js-Snakes__Menu') as HTMLButtonElement;
		this.soundOnOffBtn = el.querySelector('.js-Snakes__PlayMusic') as HTMLButtonElement;

		this.init();
	}

	private init = (): void => {
		this.soundOnOffBtn.innerHTML = SOUND_OFF;

		this.menuBtn.addEventListener('click', this.onMenuBtnClick);
		this.soundOnOffBtn.addEventListener('click', this.onCloseBtnClick);
	};

	private onMenuBtnClick = (): void => {
		this.onMenuBtnClickCb();
		this.onBtnClickCb();
	};

	private onCloseBtnClick = (): void => {
		void this.audio.playPauseBM().then(() => {
			this.soundOnOffBtn.innerHTML = this.audio.isBgMPlaying ? SOUND_ON : SOUND_OFF;
		});

		this.onBtnClickCb();
	};
}
