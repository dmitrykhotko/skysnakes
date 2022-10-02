import { Point } from '../../../utils/types';

export abstract class ArenaStrategy {
	abstract run(head: Point, width: number, height: number, snakeId: number): boolean;
}
