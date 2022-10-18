import { Controller } from './modules/controller/controller';
import { Observer } from './modules/observable/observer';
import { CanvasRenderer } from './modules/renderers/instances/canvasRenderer';
import { Timer } from './modules/timer/timer';
import { CELL_SIZE } from './utils/constants';

const run = (): void => {
	const autostart = true;
	const presenterEl = document.querySelector('.js-Snake__Presenter') as HTMLCanvasElement;
	const statEl = document.querySelector('.js-Snake__Stat') as HTMLCanvasElement;
	const serviceEl = document.querySelector('.js-Snake__ServiceInfo') as HTMLCanvasElement;

	if (!(presenterEl && serviceEl && statEl)) {
		return;
	}

	const cellSize = CELL_SIZE;
	const dpr = window.devicePixelRatio;

	let { width, height } = presenterEl.getBoundingClientRect();

	width *= dpr;
	height *= dpr;

	width -= width % cellSize;
	height -= height % cellSize;

	width /= cellSize;
	height /= cellSize;

	const timer = new Timer();
	const renderer = new CanvasRenderer({ presenterEl, statEl, serviceEl, size: { width, height } });
	const controller = new Controller({
		renderer,
		autostart,
		width,
		height,
		onStart: timer.start,
		onFinish: timer.stop
	});

	timer.subscribe(controller.notify.bind(controller) as Observer);
};

run();
