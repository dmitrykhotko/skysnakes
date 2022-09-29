import { Action, InputActions, SettingsStore, state } from '../redux';
import { SettingsActions } from '../redux/actions/actionsCreators/settingsActions';

const initButton = (selector: string, controlPanel: HTMLElement, onClick: () => void) => {
	const button = controlPanel.querySelector(selector);
	button?.addEventListener('click', onClick);
};

const setRadioValue = (name: string, value: string, controlPanel: HTMLElement): void => {
	const control = controlPanel.querySelector(`input[name="${name}"][value="${value}"]`) as HTMLInputElement;
	control.checked = true;
};

const initRadioButton = <T>(name: string, controlPanel: HTMLElement, action: (value: T) => Action) => {
	[...controlPanel.querySelectorAll(`input[name="${name}"]`)].map(control =>
		control.addEventListener('change', (e: Event) => {
			const control = e.target as HTMLInputElement;
			control.checked && state.dispatch(action(control.value as unknown as T));
		})
	);
};

export abstract class SettingsProvider {
	public static init = (controlPanel: HTMLElement): void => {
		const { playerMode, arenaType, drawGrid, deathsNum } = (state.get() as SettingsStore).settings;

		initButton('.js-Snake__Start', controlPanel, () => state.dispatch(InputActions.setStart()));
		initButton('.js-Snake__Reset', controlPanel, () => state.dispatch(InputActions.setReset()));

		setRadioValue('playerMode', playerMode, controlPanel);
		setRadioValue('arenaType', arenaType, controlPanel);
		setRadioValue('drawGrid', drawGrid, controlPanel);

		initRadioButton('playerMode', controlPanel, SettingsActions.setPlayerMode);
		initRadioButton('arenaType', controlPanel, SettingsActions.setArenaType);
		initRadioButton('drawGrid', controlPanel, SettingsActions.setDrawGrid);

		const deathsNumInput = controlPanel.querySelector('.js-Snake__DeathsNum') as HTMLInputElement;
		deathsNumInput.value = deathsNum.toString();

		deathsNumInput.addEventListener('change', () => {
			state.dispatch(SettingsActions.setDeathsNum(+deathsNumInput.value));
		});
	};
}
