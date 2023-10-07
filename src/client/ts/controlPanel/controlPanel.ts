import { Observer } from '../../../common/types';
import { EFFECTS_OFF, EFFECTS_ON, SOUND_OFF, SOUND_ON } from '../utils/labels';

export enum ControlButton {
    Menu = 1,
    BM = 2,
    Effects = 3
}

export class ControlPanel {
    private menuBtn: HTMLButtonElement;
    private bMBtn: HTMLButtonElement;
    private effectsBtn: HTMLButtonElement;
    private mapButtons: Record<ControlButton, HTMLButtonElement>;

    private effectsFlag = false;

    constructor(
        private setFocus: Observer,
        private openMenu: Observer,
        private bMOnOff: Observer<boolean, Promise<boolean>>,
        private setEffectsFlag: Observer<boolean, void>
    ) {
        const el = document.querySelector('.js-Snakes__ControlPanel') as HTMLElement;

        this.menuBtn = el.querySelector('.js-Snakes__Menu') as HTMLButtonElement;
        this.bMBtn = el.querySelector('.js-Snakes__BM') as HTMLButtonElement;
        this.effectsBtn = el.querySelector('.js-Snakes__Effects') as HTMLButtonElement;

        this.mapButtons = {
            [ControlButton.Menu]: this.menuBtn,
            [ControlButton.BM]: this.bMBtn,
            [ControlButton.Effects]: this.effectsBtn
        };

        this.init();
    }

    public toggleVisibility = (button: ControlButton, hidden = true): void =>
        void this.mapButtons[button].classList.toggle('-hidden', hidden);

    private init = (): void => {
        this.bMBtn.innerHTML = SOUND_ON;
        this.effectsBtn.innerHTML = EFFECTS_ON;

        this.menuBtn.addEventListener('click', this.onMenuBtnClick);
        this.bMBtn.addEventListener('click', this.onBMBtnClick);
        this.effectsBtn.addEventListener('click', this.onEffectsBtnClick);
    };

    private onMenuBtnClick = (): void => {
        this.openMenu();
        this.setFocus();
    };

    private onBMBtnClick = (): void => {
        void this.bMOnOff().then((isPlaying: boolean) => {
            this.bMBtn.innerHTML = isPlaying ? SOUND_OFF : SOUND_ON;
        });

        this.setFocus();
    };

    private onEffectsBtnClick = (): void => {
        this.effectsFlag = !this.effectsFlag;
        this.effectsBtn.innerHTML = this.effectsFlag ? EFFECTS_OFF : EFFECTS_ON;

        this.setEffectsFlag(this.effectsFlag);
        this.setFocus();
    };
}
