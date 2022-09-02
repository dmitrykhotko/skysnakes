import { HEIGHT, SERVICE_INFO_WIDTH, WIDTH } from '../../../utils/constants';
import { BasePresenter, CellType } from './basePresenter';

export class CanvasPresenter extends BasePresenter {
	private static colors = {
		[CellType.empty]: '#758384',
		[CellType.head]: 'red',
		[CellType.body]: 'blue',
		[CellType.coin]: 'gold',
	}

	private ctx?: CanvasRenderingContext2D;
	private serviceInfoWidth: number
	private fieldWidth: number;
	private fieldHeight: number;
	private cellSize = 25;

	constructor(element: HTMLElement, width = WIDTH, height = HEIGHT, serviceInfoWidth = SERVICE_INFO_WIDTH) {
		super(element, width, height);

		this.serviceInfoWidth = serviceInfoWidth;

		this.fieldWidth = this.width * this.cellSize;
		this.fieldHeight = this.height * this.cellSize;

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
		for (let i = 0; i < info.length; i++) {
			this.drawServiceLine(info[i], i + 1);
		}
	}

	private initContext = (): void => {
		const canvas = this.element as HTMLCanvasElement;

		canvas.width = this.fieldWidth + this.serviceInfoWidth;
		canvas.height = this.fieldHeight;

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

	private drawServiceLine = (text: string, lineNumber: number) => {
		if (!this.ctx) {
			return;
		}

		this.ctx.clearRect(this.fieldWidth + 1, this.cellSize * lineNumber - this.cellSize * .75, this.serviceInfoWidth, this.cellSize * 2);

		this.ctx.fillStyle = 'blue';
		this.ctx.font = `${this.cellSize * .75}px serif`;
		this.ctx.fillText(text, this.fieldWidth + this.cellSize, this.cellSize * lineNumber);
	}
}
