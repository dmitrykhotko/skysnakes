import { Controller } from './modules/controller/controller';
import { SmartRenderer } from './modules/renderers/instances/smartRenderer';
import { Snake } from './modules/snake/snake';
import { Timer } from './modules/timer/timer';

const run = () => {
	const canvas = document.querySelector('.js-CanvasPresenter');
	
	if (!canvas) {
		return;
	}

	const timer = new Timer();
	const snake = new Snake();

	const smartRenderer = new SmartRenderer(canvas as HTMLElement);
	const controller = new Controller(snake, smartRenderer, timer.stop);

	timer.subscribe(smartRenderer);
	timer.subscribe(controller);
};

run();
