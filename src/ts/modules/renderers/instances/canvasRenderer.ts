import { HEIGHT, TEXT_AREA_WIDTH, WIDTH } from '../../../utils/constants';
import { MoveInput, DrawGrid } from '../../../utils/enums';
import { Point } from '../../../utils/types';
import { BaseRenderer, DrawingObject } from './baseRenderer';

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
	[DrawingObject.empty]: '#E8F8F5',
	[DrawingObject.head1]: '#34495E',
	[DrawingObject.head2]: '#229954',
	[DrawingObject.body]: '#E67E22',
	[DrawingObject.coin]: '#F1C40F',
	[DrawingObject.grid]: '#758384'
};

const defaultProps = {
	textAreaWidth: TEXT_AREA_WIDTH,
	drawGrid: DrawGrid.No,
	width: WIDTH,
	height: HEIGHT
};

export type CanvasRendererProps = {
	element: HTMLElement;
	textAreaWidth?: number;
	drawGrid?: DrawGrid;
	width?: number;
	height?: number;
};

export class CanvasRenderer extends BaseRenderer {
	private element: HTMLElement;
	private textAreaWidth: number;
	private ctx!: CanvasRenderingContext2D;
	private arenaWidth: number;
	private arenaHeight: number;
	private cellSize = 25;

	constructor(props: CanvasRendererProps) {
		const cProps = { ...defaultProps, ...props };
		const { width, height } = cProps;

		super(width, height);

		({ element: this.element, textAreaWidth: this.textAreaWidth, drawGrid: this.drawGrid } = cProps);

		this.arenaWidth = this.width * this.cellSize;
		this.arenaHeight = this.height * this.cellSize;

		this.init();
	}

	override reset = (drawGrid: DrawGrid): void => {
		super.reset(drawGrid);
		this.ctx.clearRect(this.arenaWidth + 1, 0, this.textAreaWidth, this.arenaHeight);
		this.focus();
	};

	protected renderCell = ({ x, y }: Point, type: DrawingObject): void => {
		if (x >= this.width || y >= this.height) {
			return;
		}

		const cX = x * this.cellSize;
		const cY = y * this.cellSize;

		if (type !== DrawingObject.empty) {
			this.ctx.fillStyle = colors[type];
			this.ctx.fillRect(cX, cY, this.cellSize, this.cellSize);
		} else {
			this.ctx.fillStyle = colors[type];
			this.ctx.fillRect(cX, cY, this.cellSize, this.cellSize);

			if (this.drawGrid === DrawGrid.Yes) {
				this.ctx.strokeStyle = colors[DrawingObject.grid];
				this.ctx.strokeRect(cX, cY, this.cellSize, this.cellSize);
			}
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
