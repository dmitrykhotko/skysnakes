import { Controller } from './modules/controller/controller';
import { CanvasRenderer } from './modules/renderers/instances/canvasRenderer';
import { CELL_SIZE } from './utils/constants';

const run = (): void => {
	const autostart = true;
	const presenterEl = document.querySelector('.js-Snake__Presenter') as HTMLCanvasElement;
	const statEl = document.querySelector('.js-Snake__Stat') as HTMLCanvasElement;
	const serviceEl = document.querySelector('.js-Snake__ServiceInfo') as HTMLCanvasElement;

	if (!(presenterEl && serviceEl && statEl)) {
		return;
	}

	const urlParams = new URLSearchParams(window.location.search);
	const serviceInfoFlag = urlParams.get('serviceInfo') === 'true';

	const cellSize = CELL_SIZE;
	const dpr = window.devicePixelRatio;

	let { width, height } = presenterEl.getBoundingClientRect();

	width *= dpr;
	height *= dpr;

	width -= width % cellSize;
	height -= height % cellSize;

	width /= cellSize;
	height /= cellSize;

	const renderer = new CanvasRenderer({ presenterEl, statEl, serviceEl, size: { width, height } }, serviceInfoFlag);
	new Controller({
		renderer,
		autostart,
		size: { width, height }
	});
};

run();
