import { Direction as D } from '../../../../utils/enums';
import { Point } from '../../../../utils/types';
import { Field, FieldState } from '../../../field/field';
import { Snake } from '../../../snake/snake';
import { ArenaStrategy } from '../arenaStrategy';

enum Position {
	Top,
	Left,
	Bottom,
	Right,
	TopLeft,
	TopRight,
	BottomLeft,
	BottomRight
}

const P = Position;

const faceTopBottom = ({ x } : Point): D => x === 0 ? D.Right : D.Left;
const fateLeftRight = ({ y }: Point): D => y === 0 ? D.Down : D.Up;
const faceTopCorner = (dir: D) => ((_: Point, d: D) => d === D.Up ? dir : D.Down);
const faceBottomCorner = (dir: D) => ((_: Point, d: D) => d === D.Down ? dir : D.Up);

const directionSwitchers = {
	[P.Top]: faceTopBottom,
	[P.Left]: fateLeftRight,
	[P.Bottom]: faceTopBottom,
	[P.Right]: fateLeftRight,
	[P.TopLeft]: faceTopCorner(D.Right),
	[P.TopRight]: faceTopCorner(D.Left),
	[P.BottomLeft]: faceBottomCorner(D.Right),
	[P.BottomRight]: faceBottomCorner(D.Left)
};

export class SoftWallsStrategy implements ArenaStrategy {
	apply = (field: Field, { snakes, width, height }: FieldState): void => {
		Object.values(snakes).forEach(({ id, head, direction }) => {
			const pos = this.getPosition(head, direction, width, height);
			pos !== undefined && field.sendDirection(id, directionSwitchers[pos](head, direction));
		});
	}

	private getPosition = (head: Point, direction: D, width: number, height: number): Position | undefined => {
		const { x, y } = Snake.headCalcs[direction](head);

		let pos: Position;

		if (!!~x && !!~y && x !== width && y !== height) {
			return undefined;
		}

		if (!~x) {
			pos = !~y ? P.TopLeft : y === height ? P.BottomLeft : P.Left;
		} else if (x === width) {
			pos = !~y ? P.TopRight : y === height ? P.BottomRight : P.Right;
		} else if (!~y) {
			pos = P.Top;
		} else {
			pos = P.Bottom;
		}

		return pos;
	}
}
