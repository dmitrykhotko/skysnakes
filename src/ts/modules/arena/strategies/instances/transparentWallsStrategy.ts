import { Hlp } from '../../../../utils';
import { Position } from '../../../../utils/enums';
import { Id, Point } from '../../../../utils/types';
import { Action, SnakesActions } from '../../../redux';
import { BaseWallsStrategy } from './baseWallsStrategy';

export class TransparentWallsStrategy extends BaseWallsStrategy {
	private headCalcs = {
		[Position.Top]: (head: Point, _: number, height: number): number => (head.y = height),
		[Position.Left]: (head: Point, width: number): number => (head.x = width),
		[Position.Bottom]: (head: Point): number => (head.y = 0),
		[Position.Right]: (head: Point): number => (head.x = 0)
	};

	protected applyPosition = (head: Point, id: Id, position: Position): Action[] => {
		const { width, height } = Hlp.getSize();

		this.headCalcs[position](head, width, height);
		return [SnakesActions.setHead(head, id)];
	};
}
