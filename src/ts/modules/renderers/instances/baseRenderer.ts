import { DrawGrid, DrawingObject, GameStatus, Layer, Player } from '../../../utils/enums';
import { InputActions, state, BinActions } from '../../redux';
import { Bullet, Coin, GameState, PlayerInput, PlayerStat, Point, Size, SnakeData } from '../../../utils/types';
import { Renderer } from '../renderer';
import { Hlp } from '../../../utils';
import { LINE_HEIGHT, LIVE_SIZE_CELLS, SCORE_SEPARATOR } from '../../../utils/constants';

export abstract class BaseRenderer extends Renderer {
	protected drawGrid = DrawGrid.No;

	private prevState = {
		gameStatus: GameStatus.Stop,
		coins: [],
		snakes: [],
		bullets: [],
		playersStat: [],
		winners: [],
		bin: []
	} as GameState;

	private isInitialized = false;

	protected abstract use: (layer: Layer) => BaseRenderer;
	protected abstract renderRect: (point: Point, w: number, h: number, type: DrawingObject) => void;
	protected abstract renderCell: (point: Point, type: DrawingObject) => void;
	protected abstract renderCircle: (point: Point, type: DrawingObject, radius?: number, fitToCell?: boolean) => void;
	protected abstract measureText: (text: string, lineHeight: number) => number;
	protected abstract renderText: (text: string, point: Point, lineHeight: number, type: DrawingObject) => void;
	protected abstract renderTextLine: (text: string, lineNumber: number) => void;
	protected abstract clearRect: (point?: Point, size?: Size) => void;
	protected abstract clearCell: (point: Point) => void;
	protected abstract drawHeart: (point: Point, size: Size, type: DrawingObject) => void;

	constructor(protected size: Size) {
		super();
	}

	render = (state: GameState): void => {
		const { snakes, bullets, bin, playersStat } = state;

		if (!this.isInitialized) {
			this.use(Layer.Presenter).clearRect();
		}

		this.renderSnakes(snakes);
		this.renderCoins(state.coins);
		this.renderBullets(bullets);
		this.renderServiceInfo(state);
		this.renderStat(playersStat);
		this.emptyBin(bin);

		!this.isInitialized && (this.isInitialized = true);
		this.prevState = state;
	};

	protected input = (input: PlayerInput): void => {
		state.dispatch(InputActions.setInput(input));
	};

	protected renderServiceInfo(state: GameState): void {
		const { playersStat, winners, snakes, coins } = state;
		let lineNumber = 1;

		this.use(Layer.Service).clearRect();

		if (winners.length) {
			this.renderTextLine('WINNERS:', lineNumber++);

			for (let i = 0; i < winners.length; i++) {
				this.renderTextLine(`${Player[winners[i]]}`, lineNumber++);
			}

			lineNumber += 2;
		}

		for (let i = 0; i < playersStat.length; i++) {
			const { id, lives, score } = playersStat[i];

			this.renderTextLine(`Player: ${Player[id]}`, lineNumber++);
			this.renderTextLine(`Lives: ${lives}`, lineNumber++);
			this.renderTextLine(`Score: ${score}`, lineNumber);

			lineNumber += 2;
		}

		for (let i = 0; i < snakes.length; i++) {
			const {
				head: { x, y },
				id
			} = snakes[i];

			this.renderTextLine(`HEAD ${Player[id]}: x: ${x}, y: ${y}`, lineNumber++);
		}

		lineNumber++;

		this.renderTextLine(`COINS NUMBER ${coins.length}`, lineNumber++);
	}

	private renderStat = (playersStat: PlayerStat[]): void => {
		if (playersStat === this.prevState.playersStat) {
			return;
		}

		this.use(Layer.Stat).clearRect();

		const wh = LIVE_SIZE_CELLS;
		const baseX = this.size.width / 2;
		const sepLen = this.measureText(SCORE_SEPARATOR, LINE_HEIGHT);

		this.renderText(SCORE_SEPARATOR, { x: baseX - sepLen / 2, y: 3 }, LINE_HEIGHT, DrawingObject.Bullet);

		for (let i = 0; i < playersStat.length; i++) {
			const { id, lives, score } = playersStat[i];
			const type = this.getType(id);
			const text = score.toString();
			const textLength = this.measureText(text, LINE_HEIGHT);
			const livesLength = (lives + 3) * wh * (i - 1) - wh * ~(i - 1) * 2 + wh;
			const x = baseX + livesLength;

			for (let j = 0; j < lives; j++) {
				const point = { x: x + j * wh, y: 1 };

				this.drawHeart(point, { width: wh, height: wh }, type);
				this.renderCircle(point, DrawingObject.Empty);
				this.renderCircle({ x: point.x - 1, y: point.y }, DrawingObject.Empty);
				this.renderCircle({ x: point.x, y: point.y + 1 }, DrawingObject.Bullet);
				this.renderCircle({ x: point.x - 1, y: point.y + 1 }, DrawingObject.Bullet);
			}

			this.renderText(text, { x: baseX + textLength * (i - 1) + (i ? 1 : -1), y: 3 }, LINE_HEIGHT, type);
		}
	};

	private renderCoins = (coins: Coin[]): void => {
		const prevCoins = this.prevState.coins;

		if (prevCoins === coins) {
			return;
		}

		this.use(Layer.Presenter);

		for (let i = 0; i < coins.length; i++) {
			const { id, point } = coins[i];
			const notRendered = !Hlp.getById(id, prevCoins);

			notRendered && this.renderCircle(point, DrawingObject.Coin);
		}
	};

	private renderSnakes = (snakes: SnakeData[]): void => {
		this.use(Layer.Presenter);

		for (let i = 0; i < snakes.length; i++) {
			const { id, head, tail } = snakes[i];
			const type = this.getType(id);

			if (this.isInitialized) {
				this.renderCell(head, type);
				this.renderCircle(head, DrawingObject.Empty);
				head.prev && this.renderCell(head.prev, type);

				continue;
			}

			let current: Point | undefined = tail;

			while (current) {
				this.renderCell(current, type);
				current = current.next;
			}

			this.renderCircle(head, DrawingObject.Empty);
		}
	};

	private getType = (id: Player): DrawingObject => (id === Player.P1 ? DrawingObject.Head1 : DrawingObject.Head2);

	private renderBullets = (bulletsArr: Bullet[]): void => {
		this.use(Layer.Presenter);

		// TODO: render bullet tail
		for (let i = 0; i < bulletsArr.length; i++) {
			const { point } = bulletsArr[i];
			this.renderCircle(point, DrawingObject.Bullet);
		}
	};

	private emptyBin = (bin: Point[]): void => {
		this.use(Layer.Presenter);

		if (!bin.length) {
			return;
		}

		for (let i = 0; i < bin.length; i++) {
			// this.renderCircle(bin[i], DrawingObject.Empty);
			this.clearCell(bin[i]);
		}

		state.dispatch(BinActions.emptyBin());
	};
}
