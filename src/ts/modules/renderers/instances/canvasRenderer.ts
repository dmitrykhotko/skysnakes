import { HEIGHT, TEXT_AREA_WIDTH, WIDTH } from '../../../utils/constants';
import { Point } from '../../snake/snake';
import { BaseRenderer, CellType } from './baseRenderer';

export class CanvasRenderer extends BaseRenderer {
	private static colors = {
		[CellType.empty]: '#758384',
		[CellType.head]: 'red',
		[CellType.body]: 'blue',
		[CellType.coin]: 'red',
	}

	private ctx?: CanvasRenderingContext2D;
	private textAreaWidth: number
	private fieldWidth: number;
	private fieldHeight: number;
	private cellSize = 25;

	constructor(element: HTMLElement, width = WIDTH, height = HEIGHT, textAreaWidth = TEXT_AREA_WIDTH) {
		super(element, width, height);

		this.textAreaWidth = textAreaWidth;

		this.fieldWidth = this.width * this.cellSize;
		this.fieldHeight = this.height * this.cellSize;

		this.initContext();
	}

	protected renderCell = ({ x, y }: Point, type: CellType): void => {
		if (!this.ctx) {
			return;
		}

		const cX = x * this.cellSize;
		const cY = y * this.cellSize;

		if (type !== CellType.empty) {
			this.ctx.fillStyle = CanvasRenderer.colors[type];
			this.ctx.fillRect(cX, cY, this.cellSize, this.cellSize);
		} else {
			this.ctx.clearRect(cX, cY, this.cellSize, this.cellSize);
			this.ctx.strokeStyle = CanvasRenderer.colors[CellType.empty];
			this.ctx.strokeRect(cX, cY, this.cellSize, this.cellSize);
		}
	}

	protected renderTextLine = (text: string, lineNumber: number): void => {
		if (!this.ctx) {
			return;
		}

		this.ctx.clearRect(this.fieldWidth + 1, this.cellSize * lineNumber - this.cellSize * .75, this.textAreaWidth, this.cellSize * 2);

		this.ctx.fillStyle = 'blue';
		this.ctx.font = `${this.cellSize * .75}px serif`;
		this.ctx.fillText(text, this.fieldWidth + this.cellSize, this.cellSize * lineNumber);
	}

	private initContext = (): void => {
		const canvas = this.element as HTMLCanvasElement;
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			return;
		}

		canvas.width = this.fieldWidth + this.textAreaWidth;
		canvas.height = this.fieldHeight;

		this.ctx = ctx;
	};
}
