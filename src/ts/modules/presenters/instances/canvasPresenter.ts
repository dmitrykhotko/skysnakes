import { HEIGHT, WIDTH } from '../../../utils/constants';
import { BasePresenter, CellType } from './basePresenter';

export class CanvasPresenter extends BasePresenter {
	private static colors = {
		[CellType.empty]: '#758384',
		[CellType.head]: 'red',
		[CellType.body]: 'blue',
		[CellType.coin]: 'gold',
	}

	private ctx?: CanvasRenderingContext2D;
	private cellSize = 25;

	constructor(element: HTMLElement, width = WIDTH, height = HEIGHT) {
		super(element, width, height);
		this.initContext();
	}

	printField = (field: string[][]): void => {
		for (let i = 0; i < field.length; i++) {
			const row = field[i];

			for (let j = 0; j < row.length; j++) {
				this.drawCell(i, j, row[j] as CellType);
			}
		}
	}

	printServiceInfo = (info: string[]): void => {
		console.clear();
		console.log('***** SERVICE INFO *****');

		for (let i = 0; i < info.length; i++) {
			console.log(info[i]);
		}

		console.log('************************\n\n');
	}

	private initContext = (): void => {
		const canvas = this.element as HTMLCanvasElement;

		canvas.width = this.width * this.cellSize;
		canvas.height = this.height * this.cellSize;

		const ctx = canvas.getContext('2d');

		if (!ctx) {
			return;
		}

		this.ctx = ctx;
	};

	private drawCell = (x: number, y: number, type: CellType): void => {
		if (!this.ctx) {
			return;
		}

		const cX = x * this.cellSize;
		const cY = y * this.cellSize;

		if (type !== CellType.empty) {
			this.ctx.fillStyle = CanvasPresenter.colors[type];
			this.ctx.fillRect(cY, cX, this.cellSize, this.cellSize);
		} else {
			this.ctx.clearRect(cY, cX, this.cellSize, this.cellSize);
			this.ctx.strokeStyle = CanvasPresenter.colors[CellType.empty];
			this.ctx.strokeRect(cY, cX, this.cellSize, this.cellSize);
		}
	}
}
