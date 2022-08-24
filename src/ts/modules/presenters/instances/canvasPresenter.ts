import { BasePresenter } from './basePresenter';

export class CanvasPresenter extends BasePresenter {
	private ctx?: CanvasRenderingContext2D;

	constructor(element: HTMLElement) {
		super(element);
		this.initContext();
	}

	clear = (): void => {};

	printField = (field: string[][]): void => {
		console.log(field.reduce((acc, curr) => `${acc + curr.join(' ')}\n`, ''));
	}

	printServiceInfo = (info: string[]): void => {
	}

	private initContext = (): void => {
		const canvas = this.element as HTMLCanvasElement;
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			return;
		}

		this.ctx = ctx;

		ctx.fillStyle = 'rgb(200, 0, 0)';
		ctx.fillRect(10, 10, 50, 50);

		ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
		ctx.fillRect(30, 30, 50, 50);
	};
}
