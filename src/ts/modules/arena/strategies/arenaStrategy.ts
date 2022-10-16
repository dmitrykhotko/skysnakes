import { Id, Point, ResultWitActions } from '../../../utils/types';

export abstract class ArenaStrategy {
	abstract run(point: Point, id?: Id): ResultWitActions;
}
