import { Point } from '../../../../utils/types';
import { ArenaStrategy } from '../arenaStrategy';

export class NormalStrategy extends ArenaStrategy {
	run = ({ x, y }: Point): boolean => {
		return !(x === this.width || y === this.height || !~x || !~y);
	};
}
