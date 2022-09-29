import { Observer } from './observer';

export interface Observable {
	subscribe(observer: Observer, type?: string): void;

	unsubscribe(observer: Observer, type?: string): void;

	notify(...params: unknown[]): void;
}
