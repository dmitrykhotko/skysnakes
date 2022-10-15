import { Controller } from './modules/controller/controller';
import { Observer } from './modules/observable/observer';
import { CanvasRenderer } from './modules/renderers/instances/canvasRenderer';
import { Timer } from './modules/timer/timer';
import { CELL_SIZE } from './utils/constants';

const run = (): void => {
	const autostart = true;
	const presenterEl = document.querySelector('.js-Snake__Presenter') as HTMLCanvasElement;
	const serviceInfoEl = document.querySelector('.js-Snake__ServiceInfo') as HTMLCanvasElement;

	if (!(presenterEl && serviceInfoEl)) {
		return;
	}

	const cellSize = CELL_SIZE;
	const dpr = window.devicePixelRatio;

	let { width, height } = presenterEl.getBoundingClientRect();

	width *= dpr;
	height *= dpr;

	width -= width % cellSize;
	height -= height % cellSize;

	const timer = new Timer();
	const renderer = new CanvasRenderer({ presenterEl, serviceInfoEl, width, height });
	const controller = new Controller({
		renderer,
		autostart,
		width: width / cellSize,
		height: height / cellSize,
		onStart: timer.start,
		onFinish: timer.stop
	});

	timer.subscribe(controller.notify.bind(controller) as Observer);
};

run();
