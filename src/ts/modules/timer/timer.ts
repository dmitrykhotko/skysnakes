import { FPS } from '../../utils/constants';
import { BaseObservable } from '../observable/baseObservable';

export class Timer extends BaseObservable {
	private interval: number;
	private lastFrameTime = 0;
	private inProgress = true;

	constructor(fps = FPS) {
		super();
		this.interval = 1000 / fps;
	}

	start = (): void => {
		this.inProgress = true;
		requestAnimationFrame(this.animate);
	};

	stop = (): void => {
		this.inProgress = false;
	};

	private animate = (time: number): void => {
		const delta = time - this.lastFrameTime;

		this.inProgress && requestAnimationFrame(this.animate);

		if (delta > this.interval) {
			this.lastFrameTime = time - (delta % this.interval);
			this.notify();
		}
	};
}
