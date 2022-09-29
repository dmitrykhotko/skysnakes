import { Point } from '../../../../utils/types';
import { ArenaStrategy } from '../arenaStrategy';

export class NormalStrategy extends ArenaStrategy {
	run = ({ x, y }: Point, width: number, height: number): boolean => {
		return !(x === width || y === height || !~x || !~y);
	};
}
