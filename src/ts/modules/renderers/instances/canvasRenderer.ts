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
	[CellType.head1]: '#34495E',
	[CellType.head2]: '#229954',
	[CellType.body]: '#E67E22',
	[CellType.coin]: '#F1C40F'
};

export class CanvasRenderer extends BaseRenderer {
	private ctx!: CanvasRenderingContext2D;
	private arenaWidth: number;
	private arenaHeight: number;
	private cellSize = 25;

	constructor(private element: HTMLElement, width = WIDTH, height = HEIGHT, private textAreaWidth = TEXT_AREA_WIDTH) {
		super(width, height);

		this.arenaWidth = this.width * this.cellSize;
		this.arenaHeight = this.height * this.cellSize;

		this.init();
	}

	override reset = (): void => {
		super.reset();
		this.focus();
	};

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
	};

	protected renderTextLine = (text: string, lineNumber: number): void => {
		this.ctx.clearRect(
			this.arenaWidth + 1,
			this.cellSize * lineNumber - this.cellSize * 0.75,
			this.textAreaWidth,
			this.cellSize * 2
		);

		this.ctx.fillStyle = 'blue';
		this.ctx.font = `${this.cellSize * 0.75}px serif`;
		this.ctx.fillText(text, this.arenaWidth + this.cellSize, this.cellSize * lineNumber);
	};

	private init = (): void => {
		const canvas = this.element as HTMLCanvasElement;
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			return;
		}

		this.ctx = ctx;

		canvas.width = this.arenaWidth + this.textAreaWidth;
		canvas.height = this.arenaHeight;

		this.element.addEventListener('keydown', this.onKeyDown);
	};

	private onKeyDown = ({ key }: KeyboardEvent): void => {
		const input = keyInputMapping[key];
		input && this.notify(input);
	};

	private focus = (): void => {
		this.element.focus();
	};
}
