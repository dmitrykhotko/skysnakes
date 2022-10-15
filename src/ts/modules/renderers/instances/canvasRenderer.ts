import { CELL_SIZE, HEIGHT, LINE_HEIGHT, TEXT_AREA_WIDTH, WIDTH } from '../../../utils/constants';
import { DrawGrid, DrawingObject, KeyCode } from '../../../utils/enums';
import { GameState, Point } from '../../../utils/types';
import { BaseRenderer } from './baseRenderer';

const colors = {
	[DrawingObject.Empty]: '#E8F8F5',
	[DrawingObject.Head1]: '#34495E',
	[DrawingObject.Head2]: '#229954',
	[DrawingObject.Body]: '#E67E22',
	[DrawingObject.Coin]: '#F1C40F',
	[DrawingObject.Grid]: '#758384',
	[DrawingObject.Bullet]: 'red'
};

const defaultProps = {
	textAreaWidth: TEXT_AREA_WIDTH,
	drawGrid: DrawGrid.No,
	width: WIDTH,
	height: HEIGHT,
	cellSize: CELL_SIZE,
	lineHeight: LINE_HEIGHT
};

export type CanvasRendererProps = {
	element: HTMLElement;
	textAreaWidth?: number;
	drawGrid?: DrawGrid;
	width?: number;
	height?: number;
	cellSize?: number;
	lineHeight?: number;
};

export class CanvasRenderer extends BaseRenderer {
	private element: HTMLElement;
	private textAreaWidth: number;
	private ctx!: CanvasRenderingContext2D;
	private arenaWidth: number;
	private arenaHeight: number;
	private cellSize: number;
	private lineHeight: number;

	constructor(props: CanvasRendererProps) {
		const cProps = { ...defaultProps, ...props };
		const { width, height } = cProps;

		super(width, height);

		({
			element: this.element,
			textAreaWidth: this.textAreaWidth,
			drawGrid: this.drawGrid,
			cellSize: this.cellSize,
			lineHeight: this.lineHeight
		} = cProps);

		this.arenaWidth = this.width * this.cellSize;
		this.arenaHeight = this.height * this.cellSize;

		this.init();
	}

	override render(state: GameState): void {
		this.ctx.clearRect(this.arenaWidth + 1, 0, this.textAreaWidth, this.arenaHeight);
		super.render(state);
	}

	override reset = (drawGrid: DrawGrid): void => {
		super.reset(drawGrid);
		this.ctx.clearRect(this.arenaWidth + 1, 0, this.textAreaWidth, this.arenaHeight);
		this.focus();
	};

	focus = (): void => {
		this.element.focus();
	};

	protected renderCell = ({ x, y }: Point, type: DrawingObject): void => {
		if (x >= this.width || y >= this.height) {
			return;
		}

		const cX = x * this.cellSize;
		const cY = y * this.cellSize;

		if (type !== DrawingObject.Empty) {
			this.ctx.fillStyle = colors[type];
			this.ctx.fillRect(cX, cY, this.cellSize, this.cellSize);
		} else {
			this.ctx.fillStyle = colors[type];
			this.ctx.fillRect(cX, cY, this.cellSize, this.cellSize);

			if (this.drawGrid === DrawGrid.Yes) {
				this.ctx.strokeStyle = colors[DrawingObject.Grid];
				this.ctx.strokeRect(cX, cY, this.cellSize, this.cellSize);
			}
		}
	};

	protected renderTextLine = (text: string, lineNumber: number): void => {
		this.ctx.fillStyle = 'blue';
		this.ctx.font = `${this.lineHeight * 0.75}px serif`;
		this.ctx.fillText(text, this.arenaWidth + this.cellSize, this.lineHeight * lineNumber);
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

	private onKeyDown = (event: KeyboardEvent): void => {
		const playerInput = +KeyCode[event.code as unknown as KeyCode];

		if (!playerInput) {
			return;
		}

		event.preventDefault();
		this.input(playerInput);
	};
}
