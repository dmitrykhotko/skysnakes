import { Direction, Player } from '../../../../utils/enums';
import { Point } from '../../../../utils/types';
import { ArenaActions, InputActions, SnakesActions, state } from '../../../redux';
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

	protected applyPosition = (id: Player, position: Position, head: Point): void => {
		// remove send direction, create set direction action
		// arena.sendDirection(id, directionSwitchers[position](head));
		this.headCalcs[position](head);
		state.dispatch(
			SnakesActions.sendDirection(directionSwitchers[position](head), id),
			SnakesActions.setHead(head, id)
		);
	};
}
