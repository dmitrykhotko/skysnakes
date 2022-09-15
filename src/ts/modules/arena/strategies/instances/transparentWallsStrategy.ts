import { Player } from '../../../../utils/enums';
import { Point } from '../../../../utils/types';
import { Arena } from '../../arena';
import { BaseWallsStrategy, Position } from './baseWallsStrategy';

export class TransparentWallsStrategy extends BaseWallsStrategy {
	private headCalcs = {
		[Position.Top]: (head: Point): number => (head.y = this.height),
		[Position.Left]: (head: Point): number => (head.x = this.width),
		[Position.Bottom]: (head: Point): number => (head.y = 0),
		[Position.Right]: (head: Point): number => (head.x = 0)
	};

	protected applyPosition = (arena: Arena, id: Player, position: Position, head: Point): void => {
		this.headCalcs[position](head);
		arena.setHead(id, head);
	};
}
