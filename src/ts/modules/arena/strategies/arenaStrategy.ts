import { Point, ResultWitActions } from '../../../utils/types';

export abstract class ArenaStrategy {
	abstract run(point: Point, width: number, height: number, id?: number): ResultWitActions;
}
