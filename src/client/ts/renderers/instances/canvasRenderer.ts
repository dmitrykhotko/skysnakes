import { LinkedPoint, Observer, PlayerInput, Size } from '../../../../common/types';
import { CELL_SIZE, CIRCLE_RADIUS_CELLS, LINE_HEIGHT } from '../../utils/constants';
import { DrawingObject, KeyCode, Layer } from '../../utils/enums';
import { CanvasRendererProps } from '../../utils/types';
import { BaseRenderer } from './baseRenderer';

export class CanvasRenderer extends BaseRenderer {
    private static colors = {
        [DrawingObject.Empty]: '#0A045D',
        [DrawingObject.Player1]: '#BB8FCE',
        [DrawingObject.Player2]: '#00FF7F',
        [DrawingObject.StandardCoin]: '#FFFF00',
        [DrawingObject.Bullet]: '#FF3300',
        [DrawingObject.WinnersText]: '#FFFF00',
        [DrawingObject.IncScoreNotif]: '#FFFF00',
        [DrawingObject.DecScoreNotif]: '#FF3300'
    };

    private static defaultProps = {
        cellSize: CELL_SIZE,
        lineHeight: LINE_HEIGHT
    };

    private presenterEl: HTMLCanvasElement;
    private presenterLayer!: CanvasRenderingContext2D;
    private statEl: HTMLCanvasElement;
    private statLayer!: CanvasRenderingContext2D;
    private serviceEl: HTMLCanvasElement;
    private serviceLayer!: CanvasRenderingContext2D;
    private cellSize: number;
    private lineHeight: number;

    private activeLayer = this.presenterLayer;
    private layers!: Record<Layer, CanvasRenderingContext2D>;

    constructor(props: CanvasRendererProps, onInput: Observer<PlayerInput>, serviceInfoFlag: boolean) {
        const cProps = { ...CanvasRenderer.defaultProps, ...props };

        super(onInput, serviceInfoFlag);

        ({
            presenterEl: this.presenterEl,
            statEl: this.statEl,
            serviceEl: this.serviceEl,
            cellSize: this.cellSize,
            lineHeight: this.lineHeight
        } = cProps);
    }

    override init(size: Size): void {
        super.init(size);

        const wSize = this.weightSize(size);
        const dpr = window.devicePixelRatio;
        const { width: serviceElWidth } = this.serviceEl.getBoundingClientRect();
        const presenterLayer = this.initCanvas(this.presenterEl, wSize);
        const statLayer = this.initCanvas(this.statEl, wSize);
        const serviceLayer = this.initCanvas(this.serviceEl, { width: serviceElWidth * dpr, height: wSize.height });

        if (!(presenterLayer && serviceLayer && statLayer)) {
            return;
        }

        this.presenterLayer = presenterLayer;
        this.statLayer = statLayer;
        this.serviceLayer = serviceLayer;

        this.layers = {
            [Layer.Presenter]: this.presenterLayer,
            [Layer.Stat]: this.statLayer,
            [Layer.Service]: this.serviceLayer
        };

        this.presenterEl.addEventListener('keydown', this.onKeyDown);
    }

    focus = (): void => {
        this.presenterEl.focus();
    };

    protected use = (layer: Layer): BaseRenderer => {
        this.activeLayer = this.layers[layer];
        return this;
    };

    protected renderRect = ([x, y]: LinkedPoint, w: number, h: number, type: DrawingObject): void => {
        this.activeLayer.fillStyle = CanvasRenderer.colors[type];
        this.activeLayer.fillRect(x, y, w * this.cellSize, h * this.cellSize);
    };

    protected renderCell = (point: LinkedPoint, type: DrawingObject): void => {
        const [x, y] = this.weightPoint(point);

        if (type !== DrawingObject.Empty) {
            this.activeLayer.fillStyle = CanvasRenderer.colors[type];
            this.activeLayer.fillRect(x, y, this.cellSize, this.cellSize);
        } else {
            this.activeLayer.fillStyle = CanvasRenderer.colors[type];
            this.activeLayer.fillRect(x, y, this.cellSize, this.cellSize);
        }
    };

    protected clearRect = (point = [0, 0], size?: Size): void => {
        const [x, y] = this.weightPoint(point);
        const { width, height } = size ? this.weightSize(size) : this.activeLayer.canvas;

        this.activeLayer.clearRect(x, y, width, height);
    };

    protected clearCell = (point: LinkedPoint): void => {
        this.clearRect(point, { width: 1, height: 1 });
    };

    protected renderCircle = (
        point: LinkedPoint,
        type: DrawingObject,
        r = CIRCLE_RADIUS_CELLS,
        fitToCell = true
    ): void => {
        const cRadius = r * this.cellSize;
        const [x, y] = this.weightPoint(point, fitToCell ? cRadius : 0);

        this.activeLayer.fillStyle = CanvasRenderer.colors[type];
        this.activeLayer.beginPath();
        this.activeLayer.arc(x, y, cRadius, 0, 2 * Math.PI);
        this.activeLayer.fill();
    };

    protected renderTextLine = (text: string, lineNumber: number): void => {
        this.activeLayer.fillStyle = '#FFFFFF';
        this.activeLayer.font = `700 ${this.lineHeight * 0.75}px Verdana`;
        this.activeLayer.fillText(text, this.cellSize, this.lineHeight * lineNumber);
    };

    protected renderText = (text: string, point: LinkedPoint, lineHeight: number, type: DrawingObject): void => {
        const [x, y] = this.weightPoint(point);

        this.activeLayer.fillStyle = CanvasRenderer.colors[type];
        this.activeLayer.font = `700 ${lineHeight}px Verdana`;
        this.activeLayer.fillText(text, x, y);
    };

    protected measureText = (text: string, lineHeight: number): number => {
        this.activeLayer.font = `700 ${lineHeight}px Verdana`;
        return this.activeLayer.measureText(text).width / this.cellSize;
    };

    protected renderLive = (point: LinkedPoint, { width, height }: Size, type: DrawingObject, factor = 1): void => {
        const fSize = { width: width * factor, height: height * factor };
        this.renderHeart(point, fSize, type);
    };

    private renderHeart = (point: LinkedPoint, size: Size, type: DrawingObject): void => {
        const { width, height } = this.weightSize(size);
        const [x, y] = this.weightPoint(point);
        const topCurveHeight = height * 0.3;

        this.activeLayer.save();
        this.activeLayer.beginPath();
        this.activeLayer.moveTo(x, y + topCurveHeight);
        // top left curve
        this.activeLayer.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);

        // bottom left curve
        this.activeLayer.bezierCurveTo(
            x - width / 2,
            y + (height + topCurveHeight) / 2,
            x,
            y + (height + topCurveHeight) / 2,
            x,
            y + height
        );

        // bottom right curve
        this.activeLayer.bezierCurveTo(
            x,
            y + (height + topCurveHeight) / 2,
            x + width / 2,
            y + (height + topCurveHeight) / 2,
            x + width / 2,
            y + topCurveHeight
        );

        // top right curve
        this.activeLayer.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);

        this.activeLayer.closePath();
        this.activeLayer.fillStyle = CanvasRenderer.colors[type];
        this.activeLayer.fill();
        this.activeLayer.restore();
    };

    // make a single weight method
    private weightPoint = ([x, y]: LinkedPoint, extra = 0): LinkedPoint => [
        x * this.cellSize + extra,
        y * this.cellSize + extra
    ];

    private weightSize = ({ width, height }: Size, extra = 0): Size => ({
        width: width * this.cellSize + extra,
        height: height * this.cellSize + extra
    });

    private initCanvas = (
        canvas: HTMLCanvasElement,
        { width, height }: Size,
        alpha = true
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
        event.stopPropagation();

        this.onInput(playerInput);
    };
}
