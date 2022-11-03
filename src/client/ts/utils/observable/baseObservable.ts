import { Observable } from './observable';
import { Observer } from './observer';

export abstract class BaseObservable implements Observable {
	private observers = new Set<Observer>();

	subscribe = (observer: Observer): void => {
		this.observers.add(observer);
	};

	unsubscribe = (observer: Observer): void => {
		this.observers.delete(observer);
	};

	notify = (...params: unknown[]): void => this.observers.forEach(observer => observer(...params));

	unsubscribeByType = (): void => {
		this.observers = new Set<Observer>();
	};
}