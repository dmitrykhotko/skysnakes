import { Controller } from './modules/controller/controller';
import { CanvasPresenter } from './modules/presenters/instances/canvasPresenter';
// import { ConsolePresenter } from './modules/presenters/instances/consolePresenter';
import { Snake } from './modules/snake/snake';
import { GAME_SPEED } from './utils/constants';

const run = () => {
	const snake = new Snake();
	// const consolePresenter = new ConsolePresenter();
	
	const canvas = document.querySelector('.js-CanvasPresenter');
	
	if (!canvas) {
		return;
	}
	
	const canvasPresenter = new CanvasPresenter(canvas as HTMLElement);
	const controller = new Controller(snake, canvasPresenter, GAME_SPEED);
	// const controller = new Controller(snake, consolePresenter, GAME_SPEED);

	controller.start();
};

run();
