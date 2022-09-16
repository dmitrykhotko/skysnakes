import { Controller } from './modules/controller/controller';
import { HtmlPresenter } from './modules/presenter/htmlPresenter';
import { CanvasRenderer } from './modules/renderers/instances/canvasRenderer';
import { Timer } from './modules/timer/timer';

const run = () => {
	const autostart = true;
	const canvas = document.querySelector('.js-Snake__CanvasPresenter');
	const controlPanel = document.querySelector('.js-Snake__Controls');

	if (!(canvas && controlPanel)) {
		return;
	}

	const timer = new Timer();
	const canvasRenderer = new CanvasRenderer({ element: canvas as HTMLElement });
	const presenter = new HtmlPresenter(canvasRenderer, controlPanel as HTMLElement);
	const controller = new Controller({
		presenter,
		autostart,
		onStart: timer.start,
		onFinish: timer.stop
	});

	timer.subscribe(controller);
};

run();
