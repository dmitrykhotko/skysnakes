import { Hlp } from '../../../../utils';
import { Position } from '../../../../utils/enums';
import { Id, Point, ResultWitActions } from '../../../../utils/types';
import { Action } from '../../../redux';
import { ArenaStrategy } from '../arenaStrategy';

export abstract class BaseWallsStrategy extends ArenaStrategy {
	run = (point: Point, id?: number): ResultWitActions => {
		const position = this.getPosition(point);

		return {
			result: true,
			actions: id && position !== undefined ? this.applyPosition(point, id, position) : []
		};
	};

	private getPosition = (point: Point): Position | undefined => {
		const { width, height } = Hlp.getSize();
		const { x, y } = point;

		let pos: Position;

		if (!!~x && !!~y && x !== width && y !== height) {
			return undefined;
		}

		if (!~x) {
			pos = Position.Left;
		} else if (x === width) {
			pos = Position.Right;
		} else if (!~y) {
			pos = Position.Top;
		} else {
			pos = Position.Bottom;
		}

		return pos;
	};

	protected abstract applyPosition(point: Point, id: Id, position: Position): Action[];
}
