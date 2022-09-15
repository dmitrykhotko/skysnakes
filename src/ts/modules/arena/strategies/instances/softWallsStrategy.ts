import { Direction, Player } from '../../../../utils/enums';
import { Point } from '../../../../utils/types';
import { Arena } from '../../arena';
import { BaseWallsStrategy, Position } from './baseWallsStrategy';

const faceTopBottom = ({ x }: Point): Direction => (x === 0 ? Direction.Right : Direction.Left);
const fateLeftRight = ({ y }: Point): Direction => (y === 0 ? Direction.Down : Direction.Up);

const directionSwitchers = {
	[Position.Top]: faceTopBottom,
	[Position.Left]: fateLeftRight,
	[Position.Bottom]: faceTopBottom,
	[Position.Right]: fateLeftRight
};

export class SoftWallsStrategy extends BaseWallsStrategy {
	private headCalcs = {
		[Position.Top]: (head: Point): number => head.y++,
		[Position.Left]: (head: Point): number => head.x++,
		[Position.Bottom]: (head: Point): number => head.y--,
		[Position.Right]: (head: Point): number => head.x--
	};

	protected applyPosition = (arena: Arena, id: Player, position: Position, head: Point): void => {
		arena.sendDirection(id, directionSwitchers[position](head));
		this.headCalcs[position](head);
		arena.setHead(id, head);
	};
}
