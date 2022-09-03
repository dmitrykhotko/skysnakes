import { Controller } from './modules/controller/controller';
import { CanvasRenderer } from './modules/renderers/instances/canvasRenderer';
import { Snake } from './modules/snake/snake';
import { GAME_SPEED } from './utils/constants';

const run = () => {
	const snake = new Snake();
	const canvas = document.querySelector('.js-CanvasPresenter');
	
	if (!canvas) {
		return;
	}
	
	const canvasRenderer = new CanvasRenderer(canvas as HTMLElement);
	const controller = new Controller(snake, canvasRenderer, GAME_SPEED);

	controller.start();
};

run();
