import { Input, DrawGrid } from '../../utils/enums';
import { UserSettings } from '../../utils/types';
import { ArenaState } from '../arena/arena';

export abstract class Presenter {
	abstract input(input: Input): void;

	abstract onInput(cb: (input: Input) => void): void;

	abstract render(states: ArenaState): void;

	abstract reset(drawGrid: DrawGrid): void;

	abstract getUserSettings(): UserSettings;
}
