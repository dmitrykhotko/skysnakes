import { DrawGrid } from '../../utils/enums';
import { ArenaState } from '../arena/arena';

export abstract class Renderer {
	abstract render(states: ArenaState): void;
	abstract reset(drawGrid: DrawGrid): void;
}
