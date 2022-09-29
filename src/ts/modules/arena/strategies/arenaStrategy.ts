import { Point } from '../../../utils/types';
import { Arena } from '../arena';

export abstract class ArenaStrategy {
	abstract run(head: Point, width: number, height: number, snakeId: number): boolean;
}
