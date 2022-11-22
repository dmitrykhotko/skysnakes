import { GameState, Size } from '../../../common/types';

export abstract class Renderer {
	abstract init(size: Size): void;
	abstract render(states: GameState): void;
	abstract reset(): void;
	abstract focus(): void;
}
