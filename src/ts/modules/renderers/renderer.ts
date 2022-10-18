import { GameState } from '../../utils/types';

export abstract class Renderer {
	abstract render(states: GameState): void;
	abstract reset(): void;
	abstract focus(): void;
}
