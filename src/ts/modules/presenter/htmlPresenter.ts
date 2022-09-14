import { ControlInput, Input, MoveInput } from "../../utils/enums";
import { FieldState } from "../field/field";
import { Observer } from "../observable/observer";
import { Renderer } from "../renderers/renderer";
import { Presenter } from "./presenter";

export class HtmlPresenter implements Presenter, Observer {
	private onInputCb?: (input: Input) => void;

	constructor(
		private renderer: Renderer,
		private controlPanel: HTMLElement
	) {
		this.renderer.subscribe(this);
		this.initControlPanel();
	}

	input = (input: Input): void => this.onInputCb && this.onInputCb(input);

	onInput = (cb: (input: Input) => void): void => {
		this.onInputCb = cb;
	};

	render = (state: FieldState): void => this.renderer.render(state);

	reset = (): void => {
		this.renderer.reset()
	}

	notify(params: MoveInput): void {
		this.input(params);
	}

	private initControlPanel = () => {
		const startBtn = this.controlPanel.querySelector('.js-Snake__Start');

		startBtn?.addEventListener('click', this.onStartBtnClick);
	}

	private onStartBtnClick = () => {
		this.input(ControlInput.Start);
	}
}
