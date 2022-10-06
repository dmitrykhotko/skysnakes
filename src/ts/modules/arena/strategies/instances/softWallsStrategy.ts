import { Direction, Player } from '../../../../utils/enums';
import { Point } from '../../../../utils/types';
import { SnakesActions, state } from '../../../redux';
import { BaseWallsStrategy, Position } from './baseWallsStrategy';

const faceTopBottom = ({ x }: Point): Direction => (x === 0 ? Direction.Right : Direction.Left);
const fateLeftRight = ({ y }: Point): Direction => (y === 0 ? Direction.Down : Direction.Up);

const directionSwitchers = {
	[Position.Top]: faceTopBottom,
	[Position.Left]: fateLeftRight,
	[Position.Bottom]: faceTopBottom,
	[Position.Right]: fateLeftRight
};

const headCalcs = {
	[Position.Top]: (head: Point): number => head.y++,
	[Position.Left]: (head: Point): number => head.x++,
	[Position.Bottom]: (head: Point): number => head.y--,
	[Position.Right]: (head: Point): number => head.x--
};

export class SoftWallsStrategy extends BaseWallsStrategy {
	protected applyPosition = (point: Point, _: number, __: number, id: Player, position: Position): void => {
		// the next line changes point object that does not fit the redux paradigm. fix.
		headCalcs[position](point);
		state.dispatch(
			SnakesActions.sendDirection(directionSwitchers[position](point), id),
			SnakesActions.setHead(point, id)
		);
	};
}
