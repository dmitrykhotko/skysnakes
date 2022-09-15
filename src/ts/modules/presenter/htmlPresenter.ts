import { ArenaType, ControlInput, Input, MoveInput, PlayerMode } from '../../utils/enums';
import { UserSettings } from '../../utils/types';
import { ArenaState } from '../arena/arena';
import { Observer } from '../observable/observer';
import { Renderer } from '../renderers/renderer';
import { Presenter } from './presenter';

export class HtmlPresenter implements Presenter, Observer {
	private onInputCb?: (input: Input) => void;

	constructor(private renderer: Renderer, private controlPanel: HTMLElement) {
		this.renderer.subscribe(this);
		this.initControlPanel();
	}

	input = (input: Input): void => this.onInputCb && this.onInputCb(input);

	onInput = (cb: (input: Input) => void): void => {
		this.onInputCb = cb;
	};

	render = (state: ArenaState): void => this.renderer.render(state);

	reset = (): void => {
		this.renderer.reset();
	};

	getUserSettings = (): UserSettings => {
		const playerMode = this.getControlValue<PlayerMode>('playerMode');
		const arenaType = this.getControlValue<ArenaType>('arenaType');

		return {
			playerMode,
			arenaType
		};
	};

	notify(params: MoveInput): void {
		this.input(params);
	}

	private getControlValue = <T>(name: string): T => {
		const control = this.controlPanel.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement;
		return control.value as unknown as T;
	};

	private initControlPanel = () => {
		const startBtn = this.controlPanel.querySelector('.js-Snake__ControlsStart');
		startBtn?.addEventListener('click', this.onStartBtnClick);
	};

	private onStartBtnClick = () => {
		this.input(ControlInput.Start);
	};
}
