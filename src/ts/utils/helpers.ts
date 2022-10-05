import { Direction } from './enums';
import { Id, Point } from './types';

let id = 0;

export const comparePoints = ({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point): boolean => x1 === x2 && y1 === y2;

export const generateId = (): Id => ++id;

export const nextPoint = {
	[Direction.Up]: (point: Point): Point => ({ x: point.x, y: point.y - 1 }),
	[Direction.Down]: (point: Point): Point => ({ x: point.x, y: point.y + 1 }),
	[Direction.Left]: (point: Point): Point => ({ x: point.x - 1, y: point.y }),
	[Direction.Right]: (point: Point): Point => ({ x: point.x + 1, y: point.y })
};
