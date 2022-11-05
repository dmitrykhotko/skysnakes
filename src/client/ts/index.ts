import { Controller } from './controller/controller';
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
	const cellSize = CELL_SIZE;
	const dpr = window.devicePixelRatio;

	let { width, height } = presenterEl.getBoundingClientRect();

	width *= dpr;
	height *= dpr;

	width -= width % cellSize;
	height -= height % cellSize;

	width /= cellSize;
	height /= cellSize;

	new Controller({ presenterEl, statEl, serviceEl, size: { width, height } }, { width, height }, serviceInfoFlag);
};

run();
