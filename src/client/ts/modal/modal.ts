import { CommonActions, state } from '../redux';
import { KeyCode, ServiceInput } from '../utils/enums';
import { Callback } from '../utils/types';

export class Modal {
	private el: HTMLElement;
	private contentEl: HTMLElement;
	private closeBtn: HTMLButtonElement;
	private isShown = false;
	private onHide?: Callback;

	constructor(private message = '') {
		this.el = document.querySelector('.js-Snakes__Modal') as HTMLElement;
		this.contentEl = this.el.querySelector('.js-Snakes__ModalContent') as HTMLElement;
		this.closeBtn = this.el.querySelector('.js-Snakes__ModalClose') as HTMLButtonElement;

		this.init();
	}

	get isActive(): boolean {
		return this.isShown;
	}

	show = (onHide?: Callback): void => {
		if (this.isShown) {
			return;
		}

		this.isShown = true;
		this.onHide = onHide;
		this.el.classList.remove('-hidden');
		this.contentEl.focus();

		document.addEventListener('keydown', this.onKeyDown);
	};

	hide = (): void => {
		if (!this.isShown) {
			return;
		}

		this.isShown = false;
		this.el.classList.add('-hidden');
		this.onHide && this.onHide();

		state.dispatch(CommonActions.focusChanged());
		document.removeEventListener('keydown', this.onKeyDown);
	};

	private init = (): void => {
		this.contentEl.innerHTML = this.message;

		this.closeBtn.addEventListener('click', this.hide);
		this.el.querySelector('.js-Snakes__ModalDimmer')?.addEventListener('click', this.hide);
	};

	private onKeyDown = (event: KeyboardEvent): void => {
		const playerInput = +KeyCode[event.code as unknown as KeyCode];

		if (playerInput === ServiceInput.Enter || playerInput === ServiceInput.Escape) {
			this.hide();
		}
	};
}
