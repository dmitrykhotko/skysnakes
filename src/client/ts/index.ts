import { UUId } from '../../common/types';
import { Controller } from './controller/controller';
import { CELL_SIZE } from './utils/constants';

const run = (): void => {
	const layers = document.querySelector('.js-Snakes__Layers') as HTMLElement;
	const presenterEl = layers.querySelector('.js-Snakes__Presenter') as HTMLCanvasElement;
	const statEl = layers.querySelector('.js-Snakes__Stat') as HTMLCanvasElement;
	const serviceEl = layers.querySelector('.js-Snakes__ServiceInfo') as HTMLCanvasElement;

	if (!(presenterEl && serviceEl && statEl)) {
		return;
	}

	const urlParams = new URLSearchParams(window.location.search);
	const showServiceInfo = urlParams.get('serviceInfo') === 'true';
	const roomUUId = urlParams.get('room') as UUId;
	const cellSize = CELL_SIZE;
	const dpr = window.devicePixelRatio;

	let { width, height } = layers.getBoundingClientRect();

	width *= dpr;
	height *= dpr;

	width -= width % cellSize;
	height -= height % cellSize;

	width /= cellSize;
	height /= cellSize;

	new Controller({ roomUUId, showServiceInfo }, { width, height }, { presenterEl, statEl, serviceEl });
};

run();
