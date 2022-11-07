import { CoinType, GameStatus, NotifType, Player } from '../../../../common/enums';
import {
	Bullet,
	Coin,
	GameState,
	LinkedPoint,
	Notification,
	Observer,
	Size,
	SnakeArrayData,
	StatState
} from '../../../../common/types';
import { LINE_HEIGHT, LIVE_SIZE_CELLS } from '../../utils/constants';
import { DrawingObject, Layer } from '../../utils/enums';
import { HEAD, LIVES, PLAYER, RESTART_MSG, SCORE, SCORE_SEPARATOR, WINNER, WINNERS, X, Y } from '../../utils/labels';
import { Renderer } from '../renderer';

export abstract class BaseRenderer extends Renderer {
	private static defaultPrevState = {
		status: GameStatus.Finish,
		coins: [],
		snakes: [],
		bullets: [],
		stat: {
			playersStat: [],
			winners: [],
			notifications: []
		},
		bin: []
	} as GameState;

	private static coinTypeToDrawingObject = {
		[CoinType.Standard]: DrawingObject.StandardCoin,
		[CoinType.DeathPlayer1]: DrawingObject.Player1,
		[CoinType.DeathPlayer2]: DrawingObject.Player2
	};

	private static notifTypeToDrawingObject = {
		[NotifType.IncScore]: DrawingObject.IncScoreNotif,
		[NotifType.DecScore]: DrawingObject.DecScoreNotif
	};

	private prevState = BaseRenderer.defaultPrevState;
	private isInitialized = false;

	protected abstract use: (layer: Layer) => BaseRenderer;
	protected abstract renderRect: (point: LinkedPoint, w: number, h: number, type: DrawingObject) => void;
	protected abstract renderCell: (point: LinkedPoint, type: DrawingObject) => void;
	protected abstract renderCircle: (
		point: LinkedPoint,
		type: DrawingObject,
		radius?: number,
		fitToCell?: boolean
	) => void;
	protected abstract measureText: (text: string, lineHeight: number) => number;
	protected abstract renderText: (text: string, point: LinkedPoint, lineHeight: number, type: DrawingObject) => void;
	protected abstract renderTextLine: (text: string, lineNumber: number) => void;
	protected abstract clearRect: (point?: LinkedPoint, size?: Size) => void;
	protected abstract clearCell: (point: LinkedPoint) => void;
	protected abstract renderLive: (point: LinkedPoint, size: Size, type: DrawingObject, factor?: number) => void;

	constructor(protected size: Size, protected onInput: Observer, private serviceInfoFlag = true) {
		super();
	}

	render = (state: GameState): void => {
		requestAnimationFrame(() => {
			const { snakes, bullets, bin, stat } = state;

			if (!this.isInitialized) {
				this.use(Layer.Presenter).clearRect();
			}

			this.emptyBin(bin);
			this.renderSnakes(snakes);
			this.renderCoins(state.coins);
			this.renderBullets(bullets);
			this.renderStat(stat);

			this.serviceInfoFlag && this.renderServiceInfo(state);

			!this.isInitialized && (this.isInitialized = true);
			this.prevState = state;
		});
	};

	reset = (): void => {
		this.prevState = BaseRenderer.defaultPrevState;
		this.isInitialized = false;
	};

	protected renderServiceInfo(state: GameState): void {
		const {
			stat: { playersStat, winners },
			snakes,
			additionalInfo
		} = state;
		let lineNumber = 2;

		this.use(Layer.Service).clearRect();

		if (winners.length) {
			this.renderTextLine(WINNERS, lineNumber++);

			for (let i = 0; i < winners.length; i++) {
				this.renderTextLine(`${Player[winners[i]]}`, lineNumber++);
			}

			lineNumber += 2;
		}

		for (let i = 0; i < playersStat.length; i++) {
			const { id, lives, score } = playersStat[i];

			this.renderTextLine(`${PLAYER} ${Player[id]}`, lineNumber++);
			this.renderTextLine(`${LIVES} ${lives}`, lineNumber++);
			this.renderTextLine(`${SCORE} ${score}`, lineNumber);

			lineNumber += 2;
		}

		for (let i = 0; i < snakes.length; i++) {
			const { body, id } = snakes[i];

			if (!body.length) {
				return;
			}

			const { x, y } = body[0];

			this.renderTextLine(`${HEAD} ${Player[id]}${SCORE_SEPARATOR} ${X} ${x}, ${Y} ${y}`, lineNumber++);
		}

		lineNumber++;

		if (!additionalInfo) {
			return;
		}

		const aInfo = Object.entries(additionalInfo);

		for (let i = 0; i < aInfo.length; i++) {
			const [name, value] = aInfo[i];
			this.renderTextLine(`${name}:  ${value.toString()}`, lineNumber++);
		}
	}

	private renderStat = (stat: StatState): void => {
		if (stat === this.prevState.stat) {
			return;
		}

		const { playersStat, winners, notifications } = stat;

		this.renderWinners(winners);
		this.use(Layer.Stat).clearRect();

		const wh = LIVE_SIZE_CELLS;
		const baseX = this.size.width / 2;
		const sepLen = this.measureText(SCORE_SEPARATOR, LINE_HEIGHT);

		this.renderText(SCORE_SEPARATOR, { x: baseX - sepLen / 2, y: 3 }, LINE_HEIGHT, DrawingObject.Bullet);

		for (let i = 0; i < playersStat.length; i++) {
			const { id, lives, score } = playersStat[i];
			const type = this.getSnakeDrawingObject(id);
			const text = score.toString();
			const textLength = this.measureText(text, LINE_HEIGHT);

			this.renderText(text, { x: baseX + textLength * (i - 1) + (i ? 1 : -1), y: 3 }, LINE_HEIGHT, type);

			if (lives) {
				const livesLength = (lives + 3) * wh * (i - 1) - wh * ~(i - 1) * 2 + wh;

				for (let j = 0; j < lives; j++) {
					const x = baseX + livesLength + j * wh;
					this.renderLive({ x, y: 1 }, { width: wh, height: wh }, type, 0.5);
				}
			}
		}

		if (winners.length) {
			const sepLen = this.measureText(RESTART_MSG, LINE_HEIGHT);
			this.renderText(RESTART_MSG, { x: baseX - sepLen / 2, y: 8 }, LINE_HEIGHT, DrawingObject.Bullet);
		}

		this.renderNotifications(notifications);
	};

	private renderWinners = (winners: Player[]): void => {
		if (!winners.length) {
			return;
		}

		this.use(Layer.Presenter);

		const wh = LIVE_SIZE_CELLS;
		const baseX = this.size.width / 2;
		const liveH = wh * 2;
		const baseY = this.size.height / 2;
		const lineHeight = LINE_HEIGHT * 2;

		let text: string;
		let isSingleWinnerFactor: number;

		if (winners.length === 1) {
			text = WINNER;
			isSingleWinnerFactor = 0;
		} else {
			text = WINNERS;
			isSingleWinnerFactor = 1;
		}

		const textLength = this.measureText(text, lineHeight);

		for (let i = 0; i < winners.length; i++) {
			this.renderLive(
				{ x: baseX - (liveH * (i ? 1 : -1) * isSingleWinnerFactor) / 2, y: baseY - 1 },
				{ width: wh, height: wh },
				this.getSnakeDrawingObject(winners[i])
			);
		}

		this.renderText(text, { x: baseX - textLength / 2, y: baseY - 2 }, lineHeight, DrawingObject.WinnersText);
	};

	private renderNotifications = (notifications: Notification[]): void => {
		for (let i = 0; i < notifications.length; i++) {
			const {
				type,
				value,
				point: { x, y }
			} = notifications[i];
			const drawingObject = BaseRenderer.notifTypeToDrawingObject[type];

			this.renderText(value, { x, y }, LINE_HEIGHT, drawingObject);
		}
	};

	private renderCoins = (coins: Coin[]): void => {
		this.use(Layer.Presenter);

		for (let i = 0; i < coins.length; i++) {
			const { point, type } = coins[i];
			this.renderCircle(point, BaseRenderer.coinTypeToDrawingObject[type]);
		}
	};

	private renderSnakes = (snakes: SnakeArrayData[]): void => {
		this.use(Layer.Presenter);

		for (let i = 0; i < snakes.length; i++) {
			const { id, body } = snakes[i];

			if (!body.length) {
				return;
			}

			const head = body[0];
			const type = this.getSnakeDrawingObject(id);

			if (this.isInitialized) {
				this.renderCell(head, type);
				this.renderCircle(head, DrawingObject.Empty);
				body[1] && this.renderCell(body[1], type);

				continue;
			}

			for (let j = 0; j < body.length - 1; j++) {
				this.renderCell(body[j], type);
			}

			this.renderCircle(head, DrawingObject.Empty);
		}
	};

	private getSnakeDrawingObject = (id: Player): DrawingObject =>
		id === Player.P1 ? DrawingObject.Player1 : DrawingObject.Player2;

	private renderBullets = (bulletsArr: Bullet[]): void => {
		this.use(Layer.Presenter);

		// TODO: render bullet tail
		for (let i = 0; i < bulletsArr.length; i++) {
			const { point } = bulletsArr[i];
			this.renderCircle(point, DrawingObject.Bullet);
		}
	};

	private emptyBin = (bin: LinkedPoint[]): void => {
		this.use(Layer.Presenter);

		if (!bin.length) {
			return;
		}

		for (let i = 0; i < bin.length; i++) {
			this.clearCell(bin[i]);
		}
	};
}
