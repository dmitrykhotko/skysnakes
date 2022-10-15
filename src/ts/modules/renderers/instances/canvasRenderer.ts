import { CELL_SIZE, LINE_HEIGHT } from '../../../utils/constants';
import { DrawGrid, DrawingObject, KeyCode, Player } from '../../../utils/enums';
import { PlayersStat, Point, SnakeData } from '../../../utils/types';
import { BaseRenderer } from './baseRenderer';

const colors = {
	[DrawingObject.Empty]: '#E8F8F5',
	[DrawingObject.Head1]: '#34495E',
	[DrawingObject.Head2]: '#229954',
	[DrawingObject.Body]: '#E67E22',
	[DrawingObject.Coin]: '#F1C40F',
	[DrawingObject.Grid]: '#758384',
	[DrawingObject.Bullet]: '#ff3300',
	[DrawingObject.ServiceArea]: 'yellow'
};

const defaultProps = {
	drawGrid: DrawGrid.No,
	cellSize: CELL_SIZE,
	lineHeight: LINE_HEIGHT
};

export type CanvasRendererProps = {
	presenterEl: HTMLCanvasElement;
	serviceInfoEl: HTMLCanvasElement;
	drawGrid?: DrawGrid;
	width: number;
	height: number;
	cellSize?: number;
	lineHeight?: number;
};

export class CanvasRenderer extends BaseRenderer {
	private presenterEl: HTMLCanvasElement;
	private serviceInfoEl: HTMLCanvasElement;
	private presenterCtx!: CanvasRenderingContext2D;
	private serviceInfoCtx!: CanvasRenderingContext2D;
	private cellSize: number;
	private lineHeight: number;

	constructor(props: CanvasRendererProps) {
		const cProps = { ...defaultProps, ...props };
		const { width, height } = cProps;

		super(width, height);

		({
			presenterEl: this.presenterEl,
			serviceInfoEl: this.serviceInfoEl,
			drawGrid: this.drawGrid,
			cellSize: this.cellSize,
			lineHeight: this.lineHeight
		} = cProps);

		this.init();
	}

	focus = (): void => {
		this.presenterEl.focus();
	};

	protected override renderServiceInfo(playersStat: PlayersStat[], winners: Player[], snakes: SnakeData[]): void {
		this.serviceInfoCtx.clearRect(0, 0, this.serviceInfoEl.width, this.serviceInfoEl.height);
		super.renderServiceInfo(playersStat, winners, snakes);
	}

	protected renderRect = ({ x, y }: Point, w: number, h: number, type: DrawingObject): void => {
		this.presenterCtx.fillStyle = colors[type];
		this.presenterCtx.fillRect(x, y, w * this.cellSize, h * this.cellSize);
	};

	protected renderCell = ({ x, y }: Point, type: DrawingObject): void => {
		if (x >= this.width || y >= this.height) {
			return;
		}

		const cX = x * this.cellSize;
		const cY = y * this.cellSize;

		if (type !== DrawingObject.Empty) {
			this.presenterCtx.fillStyle = colors[type];
			this.presenterCtx.fillRect(cX, cY, this.cellSize, this.cellSize);
		} else {
			this.presenterCtx.fillStyle = colors[type];
			this.presenterCtx.fillRect(cX, cY, this.cellSize, this.cellSize);

			if (this.drawGrid === DrawGrid.Yes) {
				this.presenterCtx.strokeStyle = colors[DrawingObject.Grid];
				this.presenterCtx.strokeRect(cX, cY, this.cellSize, this.cellSize);
			}
		}
	};

	protected renderServiceTextLine = (text: string, lineNumber: number): void => {
		this.renderTextLine(text, lineNumber, this.serviceInfoCtx);
	};

	protected renderPresenterLine = (text: string, lineNumber: number): void => {
		this.renderTextLine(text, lineNumber, this.presenterCtx);
	};

	private renderTextLine = (text: string, lineNumber: number, ctx: CanvasRenderingContext2D): void => {
		ctx.fillStyle = 'blue';
		ctx.font = `${this.lineHeight * 0.75}px serif`;
		ctx.fillText(text, this.cellSize, this.lineHeight * lineNumber);
	};

	private init = (): void => {
		const { width: serviceInfoElWidth } = this.serviceInfoEl.getBoundingClientRect();
		const presenterCtx = this.initCanvas(this.presenterEl, this.width, this.height);
		const serviceInfoCtx = this.initCanvas(
			this.serviceInfoEl,
			serviceInfoElWidth * window.devicePixelRatio,
			this.height,
			true
		);

		if (!(presenterCtx && serviceInfoCtx)) {
			return;
		}

		this.presenterCtx = presenterCtx;
		this.serviceInfoCtx = serviceInfoCtx;

		this.presenterEl.addEventListener('keydown', this.onKeyDown);
	};

	private initCanvas = (
		canvas: HTMLCanvasElement,
		width: number,
		height: number,
		alpha = false
	): CanvasRenderingContext2D | null => {
		const ctx = canvas.getContext('2d', { alpha });

		canvas.width = width;
		canvas.height = height;

		return ctx;
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
