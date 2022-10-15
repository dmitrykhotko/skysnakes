import { Action, InputActions, SettingsStore, state } from '../redux';
import { SettingsActions } from '../redux/actions/actionsCreators/settingsActions';

const pauseContinueLabels = ['Pause', 'Continue'];
type onClickHandler = (...params: unknown[]) => void;

export abstract class SettingsProvider {
	static init = (controlPanel: HTMLElement): void => {
		const { playerMode, arenaType, drawGrid, lives } = state.get<SettingsStore>().settings;

		this.initButton('.js-Snake__Start', controlPanel, () => state.dispatch(InputActions.gameStart()));
		this.initButton('.js-Snake__Pause', controlPanel, this.pauseContinue as onClickHandler);

		this.setRadioValue('playerMode', playerMode, controlPanel);
		this.setRadioValue('arenaType', arenaType, controlPanel);
		this.setRadioValue('drawGrid', drawGrid, controlPanel);

		this.initRadioButton('playerMode', controlPanel, SettingsActions.setPlayerMode);
		this.initRadioButton('arenaType', controlPanel, SettingsActions.setArenaType);
		this.initRadioButton('drawGrid', controlPanel, SettingsActions.setDrawGrid);

		const livesInput = controlPanel.querySelector('.js-Snake__Lives') as HTMLInputElement;

		livesInput.value = lives.toString();
		livesInput.addEventListener('change', () => {
			state.dispatch(SettingsActions.setLives(+livesInput.value));
		});
	};

	private static initButton = (selector: string, controlPanel: HTMLElement, onClick: onClickHandler): void => {
		const button = controlPanel.querySelector(selector);
		button?.addEventListener('click', onClick);
	};

	private static pauseContinue = (e: MouseEvent): void => {
		const button = e.target as HTMLButtonElement;
		const label = button.innerHTML;
		const [newLabel] = pauseContinueLabels.filter(item => item !== label);

		button.innerHTML = newLabel;
		state.dispatch(InputActions.gamePause());
	};

	private static setRadioValue = (name: string, value: string, controlPanel: HTMLElement): void => {
		const control = controlPanel.querySelector(`input[name="${name}"][value="${value}"]`) as HTMLInputElement;
		control.checked = true;
	};

	private static initRadioButton = <T>(
		name: string,
		controlPanel: HTMLElement,
		action: (value: T) => Action
	): void => {
		[...controlPanel.querySelectorAll(`input[name="${name}"]`)].map(control =>
			control.addEventListener('change', (e: Event) => {
				const control = e.target as HTMLInputElement;
				control.checked && state.dispatch(action(control.value as T));
			})
		);
	};
}
