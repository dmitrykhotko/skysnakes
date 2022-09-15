import { Player } from '../../../../utils/enums';
import { Point } from '../../../../utils/types';
import { Arena } from '../../arena';
import { ArenaStrategy } from '../arenaStrategy';

export enum Position {
	Top,
	Left,
	Bottom,
	Right
}

export abstract class BaseWallsStrategy extends ArenaStrategy {
	run = (head: Point, arena: Arena, snakeId: number): boolean => {
		const position = this.getPosition(head);
		position !== undefined && this.applyPosition(arena, snakeId, position, head);

		return true;
	};

	private getPosition = (head: Point): Position | undefined => {
		const { x, y } = head;

		let pos: Position;

		if (!!~x && !!~y && x !== this.width && y !== this.height) {
			return undefined;
		}

		if (!~x) {
			pos = Position.Left;
		} else if (x === this.width) {
			pos = Position.Right;
		} else if (!~y) {
			pos = Position.Top;
		} else {
			pos = Position.Bottom;
		}

		return pos;
	};

	protected abstract applyPosition(arena: Arena, id: Player, position: Position, head: Point): void;
}
