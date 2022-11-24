import { Id, ObjectWithId, Point } from './types';

export abstract class CmHlp {
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

	static pointToNum = (width: number, point: Point): number => {
		const [x, y] = point;
		return x + y * width;
	};

	static numToPoint = (width: number, point: number): Point => {
		const x = point % width;
		const y = (point - x) / width;

		return [x, y];
	};
}
