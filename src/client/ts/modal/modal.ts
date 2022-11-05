// import { CommonActions, state } from '../redux';
import { ServiceInput } from '../../../common/enums';
import { Observer } from '../../../common/types';
import { KeyCode } from '../utils/enums';

export class Modal {
	private el: HTMLElement;
	private contentEl: HTMLElement;
	private closeBtn: HTMLButtonElement;
	private isShown = false;

	constructor(private message = '', private onHide?: Observer) {
		this.el = document.querySelector('.js-Snakes__Modal') as HTMLElement;
		this.contentEl = this.el.querySelector('.js-Snakes__ModalContent') as HTMLElement;
		this.closeBtn = this.el.querySelector('.js-Snakes__ModalClose') as HTMLButtonElement;

		this.init();
	}

	get isActive(): boolean {
		return this.isShown;
	}

	show = (): void => {
		if (this.isShown) {
			return;
		}

		this.isShown = true;
		this.el.classList.remove('-hidden');
		this.closeBtn.focus();

		document.addEventListener('keydown', this.onKeyDown);
	};

	hide = (playerInput = ServiceInput.Escape): void => {
		if (!this.isShown) {
			return;
		}

		this.isShown = false;
		this.el.classList.add('-hidden');
		this.onHide && this.onHide(playerInput);

		// state.dispatch(CommonActions.focusChanged());
		document.removeEventListener('keydown', this.onKeyDown);
	};

	private init = (): void => {
		this.contentEl.innerHTML = this.message;

		this.closeBtn.addEventListener('click', this.onCloseBtnClick);
		this.el.querySelector('.js-Snakes__ModalDimmer')?.addEventListener('click', this.onCloseBtnClick);
	};

	private onCloseBtnClick = (): void => {
		this.hide();
	};

	private onKeyDown = (event: KeyboardEvent): void => {
		const playerInput = +KeyCode[event.code as unknown as KeyCode];

		if (playerInput === ServiceInput.Enter || playerInput === ServiceInput.Escape) {
			this.hide(playerInput);
		}

		event.stopPropagation();
	};
}
