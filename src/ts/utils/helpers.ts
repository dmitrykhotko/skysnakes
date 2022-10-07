import { Direction } from './enums';
import { Id, Point } from './types';

let id = 0;

export const comparePoints = ({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point): boolean => x1 === x2 && y1 === y2;

export const generateId = (): Id => ++id;

export const nextPointCreator = {
	[Direction.Up]: (point: Point, delta = 1): Point => ({ x: point.x, y: point.y - delta }),
	[Direction.Down]: (point: Point, delta = 1): Point => ({ x: point.x, y: point.y + delta }),
	[Direction.Left]: (point: Point, delta = 1): Point => ({ x: point.x - delta, y: point.y }),
	[Direction.Right]: (point: Point, delta = 1): Point => ({ x: point.x + delta, y: point.y })
};

export const lcm = (...x: number[]): number => {
	let j = Math.max(...x);

	while (true) {
		if (x.every(b => j % b === 0)) {
			break;
		} else {
			j++;
		}
	}

	return j;
};

export const getRandomInt = (max: number): number => Math.floor(Math.random() * max);
