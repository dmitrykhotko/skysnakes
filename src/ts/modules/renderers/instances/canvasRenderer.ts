import { HEIGHT, TEXT_AREA_WIDTH, WIDTH } from '../../../utils/constants';
import { Direction, Point } from '../../snake/snake';
import { BaseRenderer, CellType } from './baseRenderer';

export class CanvasRenderer extends BaseRenderer {
	private static colors = {
		[CellType.empty]: '#758384',
		[CellType.head]: 'red',
		[CellType.body]: 'blue',
		[CellType.coin]: 'red',
	};

	private static inputMapping: Record<string, Direction> = {
		ArrowUp: Direction.Up,
		ArrowDown: Direction.Down,
		ArrowLeft: Direction.Left,
		ArrowRight: Direction.Right
	};

	private ctx?: CanvasRenderingContext2D;
	private fieldWidth: number;
	private fieldHeight: number;
	private cellSize = 25;

	constructor(private element: HTMLElement, width = WIDTH, height = HEIGHT, private textAreaWidth = TEXT_AREA_WIDTH) {
		super(width, height);

		this.fieldWidth = this.width * this.cellSize;
		this.fieldHeight = this.height * this.cellSize;

		this.init();
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

	private init = (): void => {
		const canvas = this.element as HTMLCanvasElement;
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			return;
		}

		canvas.width = this.fieldWidth + this.textAreaWidth;
		canvas.height = this.fieldHeight;

		this.ctx = ctx;

		this.element.addEventListener('keydown', this.onKeyDown);
		this.element.focus();
	}

	private onKeyDown = ({ key }: KeyboardEvent): void => {
		this.input(CanvasRenderer.inputMapping[key]);
	}
}
