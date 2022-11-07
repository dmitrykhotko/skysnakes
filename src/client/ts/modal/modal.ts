import { ServiceInput } from '../../../common/enums';
import { Observer } from '../../../common/types';
import { KeyCode, ModalType } from '../utils/enums';
import { GAME_OVER_MSG, WELCOME_SCREEN_MSG } from '../utils/labels';
import { ShowModalArgs } from '../utils/types';

export class Modal {
	private static messages = {
		[ModalType.WelcomeScreen]: WELCOME_SCREEN_MSG,
		[ModalType.GameOver]: GAME_OVER_MSG
	};

	private el: HTMLElement;
	private dimmerEl!: HTMLElement;
	private topContentEl!: HTMLElement;
	private mainContentEl!: HTMLElement;
	private bottomContentEl!: HTMLElement;
	private closeBtn!: HTMLButtonElement;
	private isShown = false;
	private onHideInternal?: () => void;

	constructor(private onHide?: Observer) {
		this.el = document.querySelector('.js-Snakes__Modal') as HTMLElement;
		this.dimmerEl = this.el.querySelector('.js-Snakes__ModalDimmer') as HTMLElement;

		this.init();
	}

	get isActive(): boolean {
		return !!this.isShown;
	}

	show = ({
		type,
		topContent = '',
		mainContent = Modal.messages[type],
		bottomContent = '',
		isStatic = false
	}: ShowModalArgs): void => {
		if (this.isShown) {
			return;
		}

		this.isShown = true;
		this.topContentEl.innerHTML = topContent;
		this.mainContentEl.innerHTML = mainContent;
		this.bottomContentEl.innerHTML = bottomContent;

		if (isStatic) {
			this.closeBtn?.classList.add('-hidden');

			this.dimmerEl.removeEventListener('click', this.onCloseBtnClick);
			this.onHideInternal = this.initDimmer;
		} else {
			this.closeBtn?.classList.remove('-hidden');
			this.closeBtn?.focus();

			document.addEventListener('keydown', this.onKeyDown);
		}

		this.el.classList.remove('-hidden');
	};

	hide = (): void => {
		if (!this.isShown) {
			return;
		}

		this.isShown = false;
		this.el.classList.add('-hidden');

		document.removeEventListener('keydown', this.onKeyDown);

		if (this.onHideInternal) {
			this.onHideInternal();
			this.onHideInternal = undefined;
		}
	};

	private init = (): void => {
		this.topContentEl = this.el.querySelector('.js-Snakes__ModalContentTop') as HTMLElement;
		this.mainContentEl = this.el.querySelector('.js-Snakes__ModalContentMain') as HTMLElement;
		this.bottomContentEl = this.el.querySelector('.js-Snakes__ModalContentBottom') as HTMLElement;
		this.closeBtn = this.el.querySelector('.js-Snakes__ModalClose') as HTMLButtonElement;

		this.closeBtn.addEventListener('click', this.onCloseBtnClick);

		this.initDimmer();
	};

	private initDimmer = (): void => {
		this.dimmerEl.addEventListener('click', this.onCloseBtnClick);
	};

	private onCloseBtnClick = (): void => {
		this.hide();
		this.onHide && this.onHide(ServiceInput.Escape);
	};

	private onKeyDown = (event: KeyboardEvent): void => {
		const playerInput = +KeyCode[event.code as unknown as KeyCode];

		if (playerInput === ServiceInput.Enter || playerInput === ServiceInput.Escape) {
			this.hide();
			this.onHide && this.onHide(playerInput);
		}

		event.stopPropagation();
	};
}
