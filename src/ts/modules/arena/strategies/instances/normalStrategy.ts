import { Point, ResultWitActions } from '../../../../utils/types';
import { ArenaStrategy } from '../arenaStrategy';

export class NormalStrategy extends ArenaStrategy {
	run = ({ x, y }: Point, width: number, height: number): ResultWitActions => {
		return {
			result: !(x === width || y === height || !~x || !~y),
			actions: []
		};
	};
}
