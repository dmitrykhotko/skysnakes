import { BasePresenter } from './basePresenter';

export class ConsolePresenter extends BasePresenter {
	constructor(element = document.body) {
		super(element);
	}

	clear = (): void => console.clear();

	printField = (field: string[][]): void => {
		console.log(field.reduce((acc, curr) => `${acc + curr.join(' ')}\n`, ''));
	}

	printServiceInfo = (info: string[]): void => {
		console.log('***** SERVICE INFO *****');

		for (let i = 0; i < info.length; i++) {
			console.log(info[i]);
		}

		console.log('************************\n\n');
	}
}
