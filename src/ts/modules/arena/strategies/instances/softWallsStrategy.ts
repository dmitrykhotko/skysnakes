import { Direction, Player } from '../../../../utils/enums';
import { Point } from '../../../../utils/types';
import { Action, SnakesActions } from '../../../redux';
import { BaseWallsStrategy, Position } from './baseWallsStrategy';

const faceTopBottom = ({ x }: Point): Direction => (x === 0 ? Direction.Right : Direction.Left);
const fateLeftRight = ({ y }: Point): Direction => (y === 0 ? Direction.Down : Direction.Up);

const directionSwitchers = {
	[Position.Top]: faceTopBottom,
	[Position.Left]: fateLeftRight,
	[Position.Bottom]: faceTopBottom,
	[Position.Right]: fateLeftRight
};

const pointCalcs = {
	[Position.Top]: (point: Point): Point => ({ ...point, ...{ y: point.y + 1 } }),
	[Position.Left]: (point: Point): Point => ({ ...point, ...{ x: point.x + 1 } }),
	[Position.Bottom]: (point: Point): Point => ({ ...point, ...{ y: point.y - 1 } }),
	[Position.Right]: (point: Point): Point => ({ ...point, ...{ x: point.x - 1 } })
};

export class SoftWallsStrategy extends BaseWallsStrategy {
	protected applyPosition = (point: Point, _: number, __: number, id: Player, position: Position): Action[] => {
		const newPoint = pointCalcs[position](point);

		if (newPoint.prev) {
			newPoint.prev.next = newPoint;
		}

		return [
			SnakesActions.sendDirection(directionSwitchers[position](newPoint), id),
			SnakesActions.setHead(newPoint, id)
		];
	};
}
