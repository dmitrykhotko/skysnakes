import { SnakesStore, SnakeState, state } from '../../modules/redux';
import { Player } from '../enums';
import { Hlp } from '../hlp';

export abstract class SnakesUtils {
	static get = (): SnakeState[] => state.get<SnakesStore>().snakes;

	static getById = (id: Player): SnakeState => Hlp.getById(id, this.get());
}
