import { Id, ObjectWithId } from './types';

export const getById = <T extends ObjectWithId>(id: Id, items: T[]): T => {
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
