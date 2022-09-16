import { ArenaType, ControlInput, Input, MoveInput, PlayerMode, DrawGrid } from '../../utils/enums';
import { UserSettings } from '../../utils/types';
import { ArenaState } from '../arena/arena';
import { Observer } from '../observable/observer';
import { Renderer } from '../renderers/renderer';
import { Presenter } from './presenter';

export class HtmlPresenter implements Presenter, Observer {
	private onInputCb?: (input: Input) => void;
	private deathsNumInput!: HTMLInputElement;

	constructor(private renderer: Renderer, private controlPanel: HTMLElement) {
		this.renderer.subscribe(this);
		this.initControlPanel();
	}

	input = (input: Input): void => this.onInputCb && this.onInputCb(input);

	onInput = (cb: (input: Input) => void): void => {
		this.onInputCb = cb;
	};

	render = (state: ArenaState): void => this.renderer.render(state);

	reset = (drawGrid: DrawGrid): void => {
		this.renderer.reset(drawGrid);
	};

	getUserSettings = (): UserSettings => {
		const playerMode = this.getRadioValue<PlayerMode>('playerMode');
		const arenaType = this.getRadioValue<ArenaType>('arenaType');
		const drawGrid = this.getRadioValue<DrawGrid>('drawGrid');
		const deathsNum = parseInt(this.deathsNumInput.value);

		return {
			playerMode,
			arenaType,
			deathsNum,
			drawGrid
		};
	};

	notify(params: MoveInput): void {
		this.input(params);
	}

	private getRadioValue = <T>(name: string): T => {
		const control = this.controlPanel.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement;
		return control.value as unknown as T;
	};

	private initControlPanel = () => {
		this.initControlButton('.js-Snake__Start', ControlInput.Start);
		this.initControlButton('.js-Snake__Reset', ControlInput.Reset);

		this.deathsNumInput = this.controlPanel.querySelector('.js-Snake__DeathsNum') as HTMLInputElement;
	};

	private initControlButton = (selector: string, input: ControlInput) => {
		const button = this.controlPanel.querySelector(selector);
		button?.addEventListener('click', () => this.input(input));
	};
}
