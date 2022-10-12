import { GAME_SPEED } from '../../utils/constants';
import { BaseObservable } from '../observable/baseObservable';

export class Timer extends BaseObservable {
	private frameMinTime: number;
	private intervalId!: NodeJS.Timer;

	constructor(framesPerSecond = GAME_SPEED) {
		super();
		this.frameMinTime = (1000 / 60) * (60 / framesPerSecond) - (1000 / 60) * 0.5;
	}

	start = (): void => {
		this.intervalId = setInterval(requestAnimationFrame.bind(null, this.notify), this.frameMinTime);
	};

	stop = (): void => {
		this.intervalId && clearInterval(this.intervalId);
	};
}
