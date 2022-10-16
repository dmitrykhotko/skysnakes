import { Bullets } from '../modules/arena/characters/bullets';
import { Coins } from '../modules/arena/characters/coins';
import { Snakes } from '../modules/arena/characters/snakes';
import { Direction } from './enums';
import { Id, ObjectWithId, Point } from './types';

export abstract class Hlp {
	private static id = 0;

	private static nextPointCreators = {
		[Direction.Up]: (point: Point, delta = 1): Point => ({ x: point.x, y: point.y - delta }),
		[Direction.Down]: (point: Point, delta = 1): Point => ({ x: point.x, y: point.y + delta }),
		[Direction.Left]: (point: Point, delta = 1): Point => ({ x: point.x - delta, y: point.y }),
		[Direction.Right]: (point: Point, delta = 1): Point => ({ x: point.x + delta, y: point.y })
	};

	static nextPoint = (point: Point, direction: Direction): Point => {
		return this.nextPointCreators[direction](point);
	};

	static comparePoints = ({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point): boolean => x1 === x2 && y1 === y2;

	static generateId = (): Id => ++this.id;

	static lcm = (...x: number[]): number => {
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

	static randomInt = (max: number): number => Math.floor(Math.random() * max);

	static getById = <T extends ObjectWithId>(id: Id, items: T[]): T => {
		let target!: T;

		for (let i = 0; i < items.length; i++) {
			const item = items[i];

			if (item.id === id) {
				target = item;
				break;
			}
		}

		return target;
	};

	static filterById = <T extends ObjectWithId>(id: Id, items: T[]): T[] => {
		const targets = [];

		for (let i = 0; i < items.length; i++) {
			const item = items[i];

			if (item.id !== id) {
				targets.push(item);
			}
		}

		return targets;
	};

	// not sure about this method here
	static getFreeCells = (width: number, height: number): number[] => {
		const cells: number[] = [];
		const set = new Set<number>([
			...Coins.toNumbers(width),
			...Snakes.toNumbers(width),
			...Bullets.toNumbers(width)
		]);

		for (let i = 0; i < width * height; i++) {
			if (set.has(i)) {
				continue;
			}

			cells.push(i);
		}

		return cells;
	};
}
