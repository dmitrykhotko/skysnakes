import { SmartController } from './modules/controller/smartController';
import { CanvasRenderer } from './modules/renderers/instances/canvasRenderer';
import { Snake } from './modules/snake/snake';
import { Timer } from './modules/timer/timer';

const run = () => {
	const canvas = document.querySelector('.js-CanvasPresenter');
	
	if (!canvas) {
		return;
	}

	const timer = new Timer();
	const snake = new Snake();

	const canvasRenderer = new CanvasRenderer(canvas as HTMLElement);
	const controller = new SmartController(snake, canvasRenderer, timer.stop);

	timer.subscribe(controller);
};

run();
