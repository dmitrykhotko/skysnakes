import { ArenaStore, state } from '../modules/redux';
import { Direction } from './enums';
import { Id, ObjectWithId, Point, Size } from './types';

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

	static randomInt = (max: number, min = 0): number => Math.floor(Math.random() * (max - min + 1)) + min;

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

	static filter = <T>(
		items: T[],
		prop: keyof T,
		value: T[keyof T],
		predicate = (item1: T[keyof T], item2: T[keyof T]): boolean => item1 !== item2
	): T[] => {
		const targets = [];

		for (let i = 0; i < items.length; i++) {
			const item = items[i];

			if (predicate(item[prop], value)) {
				targets.push(item);
			}
		}

		return targets;
	};

	static excludeById = <T extends ObjectWithId>(items: T[], id: T[keyof T]): T[] => {
		return this.filter(items, 'id', id);
	};

	static mapByProp = <T>(arr: T[], prop: keyof T): T[keyof T][] => {
		const result = [] as T[keyof T][];

		for (let i = 0; i < arr.length; i++) {
			result.push(arr[i][prop]);
		}

		return result;
	};

	static getSize = (): Size => state.get<ArenaStore>().arena.size;
}
