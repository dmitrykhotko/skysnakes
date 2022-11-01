import { Controller } from './controller/controller';
import { CanvasRenderer } from './renderers/instances/canvasRenderer';
import { CELL_SIZE } from './utils/constants';

const run = (): void => {
	const presenterEl = document.querySelector('.js-Snakes__Presenter') as HTMLCanvasElement;
	const statEl = document.querySelector('.js-Snakes__Stat') as HTMLCanvasElement;
	const serviceEl = document.querySelector('.js-Snakes__ServiceInfo') as HTMLCanvasElement;

	if (!(presenterEl && serviceEl && statEl)) {
		return;
	}

	const urlParams = new URLSearchParams(window.location.search);
	const serviceInfoFlag = urlParams.get('serviceInfo') === 'true';
	const autostart = urlParams.get('autostart') === 'true';

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
	new Controller(renderer, { width, height }, autostart);
};

run();
