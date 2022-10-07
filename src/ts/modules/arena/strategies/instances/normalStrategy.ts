import { Point } from '../../../../utils/types';
import { ArenaStrategy, StrategyResult } from '../arenaStrategy';

export class NormalStrategy extends ArenaStrategy {
	run = ({ x, y }: Point, width: number, height: number): StrategyResult => {
		return {
			success: !(x === width || y === height || !~x || !~y)
		};
	};
}
