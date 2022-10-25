import { FPS } from '../../utils/constants';
import { Observer } from '../observable/observer';

const requestIdleCallback = !!window.requestIdleCallback
	? window.requestIdleCallback.bind(window)
	: window.setTimeout.bind(window);

export class Timer {
	private interval: number;
	private lastFrameTime = 0;
	private rAFId?: number;

	constructor(private renderCb: Observer, private calculateCb: Observer, fps = FPS) {
		this.interval = 1000 / fps;
	}

	start = (): void => {
		this.rAFId = requestAnimationFrame(this.render);
	};

	stop = (): void => {
		this.rAFId && cancelAnimationFrame(this.rAFId);
	};

	private render = (time: number): void => {
		const delta = time - this.lastFrameTime;
		this.rAFId = requestAnimationFrame(this.render);

		if (delta < this.interval) {
			return;
		}

		this.lastFrameTime = time - (delta % this.interval);
		this.renderCb();

		requestIdleCallback(this.calculateCb);
	};
}
