import { Hlp } from '../../../../utils';
import { Point, ResultWitActions } from '../../../../utils/types';
import { ArenaStrategy } from '../arenaStrategy';

export class NormalStrategy extends ArenaStrategy {
	run = ({ x, y }: Point): ResultWitActions => {
		const { width, height } = Hlp.getSize();

		return {
			result: !(x === width || y === height || !~x || !~y),
			actions: []
		};
	};
}
