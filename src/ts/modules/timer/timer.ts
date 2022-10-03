import { GAME_SPEED } from '../../utils/constants';
import { BaseObservable } from '../observable/baseObservable';

export class Timer extends BaseObservable {
	private frameMinTime: number;
	private lastFrameTime = 0;
	private inProgress = true;

	constructor(framesPerSecond = GAME_SPEED) {
		super();
		this.frameMinTime = (1000 / 60) * (60 / framesPerSecond) - (1000 / 60) * 0.5;
	}

	start = (): void => {
		this.inProgress = true;
		requestAnimationFrame(this.animate);
	};

	stop = (): void => {
		this.inProgress = false;
	};

	private animate = (time: number): void => {
		if (time - this.lastFrameTime < this.frameMinTime) {
			requestAnimationFrame(this.animate);
			return;
		}

		this.lastFrameTime = time;

		this.notify();
		this.inProgress && requestAnimationFrame(this.animate);
	};
}
