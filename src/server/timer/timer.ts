import { Observer } from '../../common/types';
import { FPS } from '../utils/constants';

export class Timer {
	private interval: number;
	private iId?: NodeJS.Timer;

	constructor(private task: Observer, fps = FPS) {
		this.interval = 1000 / fps;
	}

	start = (): void => {
		this.stop();
		this.iId = setInterval(this.task, this.interval);
	};

	stop = (): void => {
		this.iId && clearInterval(Number(this.iId));
	};
}
