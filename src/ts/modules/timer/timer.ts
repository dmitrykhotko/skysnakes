import { GAME_SPEED } from '../../utils/constants';
import { ObservableBase } from '../observable/observableBase';

export class Timer extends ObservableBase {
	private interval: number;
	private intervalId?: NodeJS.Timer;

	constructor(
		framesNumber = GAME_SPEED
	) {
		super();
		this.interval = 1000 / framesNumber;
	}

	start = (): void => {
		this.stop();
		this.intervalId = setInterval(this.notify, this.interval);
	};

	stop = (): void => clearInterval(this.intervalId);
}
