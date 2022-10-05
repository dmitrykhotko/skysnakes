import { DrawGrid } from '../../utils/enums';
import { GameState } from '../../utils/types';

export abstract class Renderer {
	abstract render(states: GameState): void;
	abstract reset(drawGrid: DrawGrid): void;
}
