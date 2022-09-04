import { GAME_SPEED } from '../../utils/constants';
import { Observable } from '../observable/observable';
import { Observer } from '../observable/observer';

export class Timer implements Observable {
	private observers = new Set<Observer>();
	private intervalId?: NodeJS.Timer;

	constructor(
		private framesNumber = GAME_SPEED,
		autostart = true
	) {
		autostart && this.start();
	}

	subscribe = (observer: Observer): void => {
		this.observers.add(observer);
	};

	unsubscribe = (observer: Observer): void => {
		this.observers.delete(observer);
	};

	notify = (): void => this.observers.forEach(observer => observer.notify());

	start = (): void => {
		const interval = 1000 / this.framesNumber;
		this.intervalId = setInterval(this.notify, interval);
	};

	stop = (): void => clearInterval(this.intervalId);
}
