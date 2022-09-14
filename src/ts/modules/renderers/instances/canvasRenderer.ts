import { HEIGHT, TEXT_AREA_WIDTH, WIDTH } from '../../../utils/constants';
import { MoveInput } from '../../../utils/enums';
import { Point } from '../../../utils/types';
import { BaseRenderer, CellType } from './baseRenderer';

const keyInputMapping: Record<string, MoveInput> = {
	ArrowUp: MoveInput.RUp,
	ArrowDown: MoveInput.RDown,
	ArrowLeft: MoveInput.RLeft,
	ArrowRight: MoveInput.RRight,
	w: MoveInput.LUp,
	s: MoveInput.LDown,
	a: MoveInput.LLeft,
	d: MoveInput.LRight
};

const colors = {
	[CellType.empty]: '#758384',
	[CellType.head]: 'red',
	[CellType.body]: 'blue',
	[CellType.coin]: 'red',
};

export class CanvasRenderer extends BaseRenderer {
	private ctx!: CanvasRenderingContext2D;
	private fieldWidth: number;
	private fieldHeight: number;
	private cellSize = 25;

	constructor(private element: HTMLElement, width = WIDTH, height = HEIGHT, private textAreaWidth = TEXT_AREA_WIDTH) {
		super(width, height);

		this.fieldWidth = this.width * this.cellSize;
		this.fieldHeight = this.height * this.cellSize;

		this.init();
	}

	override reset = (): void => {
		super.reset();
		this.focus();
	}

	protected renderCell = ({ x, y }: Point, type: CellType): void => {
		if (x >= this.width || y >= this.height) {
			return;
		}

		const cX = x * this.cellSize;
		const cY = y * this.cellSize;

		if (type !== CellType.empty) {
			this.ctx.fillStyle = colors[type];
			this.ctx.fillRect(cX, cY, this.cellSize, this.cellSize);
		} else {
			this.ctx.clearRect(cX, cY, this.cellSize, this.cellSize);
			this.ctx.strokeStyle = colors[CellType.empty];
			this.ctx.strokeRect(cX, cY, this.cellSize, this.cellSize);
		}
	}

	protected renderTextLine = (text: string, lineNumber: number): void => {
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

		this.ctx = ctx;

		canvas.width = this.fieldWidth + this.textAreaWidth;
		canvas.height = this.fieldHeight;

		this.element.addEventListener('keydown', this.onKeyDown);
	}

	private onKeyDown = ({ key }: KeyboardEvent): void => {
		const input = keyInputMapping[key];
		input && this.notify(input);
	}

	private focus = (): void => {
		this.element.focus();
	}
}
