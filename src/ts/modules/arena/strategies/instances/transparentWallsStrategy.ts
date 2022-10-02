import { Player } from '../../../../utils/enums';
import { Point } from '../../../../utils/types';
import { SnakesActions, state } from '../../../redux';
import { BaseWallsStrategy, Position } from './baseWallsStrategy';

export class TransparentWallsStrategy extends BaseWallsStrategy {
	private headCalcs = {
		[Position.Top]: (head: Point, _: number, height: number): number => (head.y = height),
		[Position.Left]: (head: Point, width: number): number => (head.x = width),
		[Position.Bottom]: (head: Point): number => (head.y = 0),
		[Position.Right]: (head: Point): number => (head.x = 0)
	};

	protected applyPosition = (id: Player, position: Position, head: Point, width: number, height: number): void => {
		this.headCalcs[position](head, width, height);
		state.dispatch(SnakesActions.setHead(head, id));
	};
}