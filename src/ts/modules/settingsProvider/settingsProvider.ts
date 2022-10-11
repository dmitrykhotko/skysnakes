import { Action, ArenaActions, InputActions, SettingsStore, state } from '../redux';
import { SettingsActions } from '../redux/actions/actionsCreators/settingsActions';

const initButton = (selector: string, controlPanel: HTMLElement, onClick: () => void): void => {
	const button = controlPanel.querySelector(selector);
	button?.addEventListener('click', onClick);
};

const setRadioValue = (name: string, value: string, controlPanel: HTMLElement): void => {
	const control = controlPanel.querySelector(`input[name="${name}"][value="${value}"]`) as HTMLInputElement;
	control.checked = true;
};

const initRadioButton = <T>(name: string, controlPanel: HTMLElement, action: (value: T) => Action): void => {
	[...controlPanel.querySelectorAll(`input[name="${name}"]`)].map(control =>
		control.addEventListener('change', (e: Event) => {
			const control = e.target as HTMLInputElement;
			control.checked && state.dispatch(action(control.value as T));
		})
	);
};

export abstract class SettingsProvider {
	public static init = (controlPanel: HTMLElement): void => {
		const { playerMode, arenaType, drawGrid, lives } = state.get<SettingsStore>().settings;

		initButton('.js-Snake__Start', controlPanel, () => state.dispatch(InputActions.setStart()));
		initButton('.js-Snake__Reset', controlPanel, () => state.dispatch(InputActions.setReset()));
		initButton('.js-Snake__Stop', controlPanel, () => state.dispatch(ArenaActions.setInProgress(false)));

		setRadioValue('playerMode', playerMode, controlPanel);
		setRadioValue('arenaType', arenaType, controlPanel);
		setRadioValue('drawGrid', drawGrid, controlPanel);

		initRadioButton('playerMode', controlPanel, SettingsActions.setPlayerMode);
		initRadioButton('arenaType', controlPanel, SettingsActions.setArenaType);
		initRadioButton('drawGrid', controlPanel, SettingsActions.setDrawGrid);

		const livesInput = controlPanel.querySelector('.js-Snake__Lives') as HTMLInputElement;
		livesInput.value = lives.toString();

		livesInput.addEventListener('change', () => {
			state.dispatch(SettingsActions.setLives(+livesInput.value));
		});
	};
}
