import { Controller } from './modules/controller/controller';
import { Observer } from './modules/observable/observer';
import { SettingsProvider } from './modules/settingsProvider/settingsProvider';
import { CanvasRenderer } from './modules/renderers/instances/canvasRenderer';
import { Timer } from './modules/timer/timer';

const run = (): void => {
	const autostart = true;
	const canvas = document.querySelector('.js-Snake__CanvasPresenter');
	const controlPanel = document.querySelector('.js-Snake__Settings');

	SettingsProvider.init(controlPanel as HTMLElement);

	const timer = new Timer();
	const renderer = new CanvasRenderer({ element: canvas as HTMLElement });
	const controller = new Controller({
		renderer,
		autostart,
		onStart: timer.start,
		onFinish: timer.stop
	});

	timer.subscribe(controller.notify.bind(controller) as Observer);
};

run();
