class AutoErasable<T = unknown> {
	constructor(private data: T | undefined, delay: number) {
		setTimeout(this.erase, delay);
	}

	get = (): T | undefined => this.data;

	private erase = (): void => (this.data = undefined);
}

type Key = string | number;

export class AutoErasables {
	private data = {} as Record<Key, AutoErasable[]>;

	set = (key: Key, item: unknown[], delay: number): void => {
		!this.data[key] && (this.data[key] = [] as AutoErasable[]);
		this.data[key].push(new AutoErasable(item, delay));
	};

	get = <T>(key: Key): T[] | undefined => {
		if (!this.data[key]) {
			return;
		}

		const aEData = this.data[key];
		const result = [] as T[];
		const emptyItems = [] as AutoErasable[];

		for (let i = 0; i < aEData.length; i++) {
			const aEItem = aEData[i];
			const dataItems = aEItem.get();

			if (dataItems) {
				result.push(...(dataItems as T[]));
			} else {
				emptyItems.push(aEItem);
			}
		}

		for (let i = 0; i < emptyItems.length; i++) {
			const item = emptyItems[i];
			const indx = aEData.indexOf(item);

			if (!~indx) {
				continue;
			}

			aEData.splice(indx, 1);
		}

		!aEData.length && delete this.data[key];

		return result;
	};
}
