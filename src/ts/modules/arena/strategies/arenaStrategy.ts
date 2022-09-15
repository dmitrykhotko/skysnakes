import { Point } from '../../../utils/types';
import { Arena } from '../arena';

export abstract class ArenaStrategy {
	constructor(protected width: number, protected height: number) {}

	abstract run(head: Point, arena: Arena, snakeId: number): boolean;
}
