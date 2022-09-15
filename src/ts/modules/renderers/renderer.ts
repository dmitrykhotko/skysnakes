import { ArenaState } from '../arena/arena';
import { BaseObservable } from '../observable/baseObservable';

export abstract class Renderer extends BaseObservable {
	abstract render(states: ArenaState): void;
	abstract reset(): void;
}
