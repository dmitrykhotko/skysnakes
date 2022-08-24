import { Controller } from './modules/controller/controller';
import { ConsolePresenter } from './modules/presenters/instances/consolePresenter';
import { Snake } from './modules/snake/snake';

const run = () => {
	const snake = new Snake();
	const consolePresenter = new ConsolePresenter();
	const controller = new Controller(snake, consolePresenter, 2);

	controller.start();
};

run();
