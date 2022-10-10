import { SnakesStore, SnakeState, state } from '../../modules/redux';
import { Player } from '../enums';
import { getById } from '../helpers';

export abstract class SnakesUtils {
	static get = (): SnakeState[] => state.get<SnakesStore>().snakes;

	static getById = (id: Player): SnakeState => getById(id, this.get());
}
