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
	run = (head: Point, width: number, height: number, snakeId: number): boolean => {
		const position = this.getPosition(head, width, height);
		position !== undefined && this.applyPosition(snakeId, position, head, width, height);

		return true;
	};

	private getPosition = (head: Point, width: number, height: number): Position | undefined => {
		const { x, y } = head;

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

	protected abstract applyPosition(id: Player, position: Position, head: Point, width: number, height: number): void;
}
