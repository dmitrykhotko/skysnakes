import { DrawGrid, DrawingObject, Player } from '../../../utils/enums';
import { InputActions, state, BinActions } from '../../redux';
import { Bullet, GameState, PlayerInput, PlayersStat, Point, SnakeData } from '../../../utils/types';
import { Renderer } from '../renderer';

export abstract class BaseRenderer extends Renderer {
	protected drawGrid = DrawGrid.No;

	private isInitialized = false;

	protected abstract renderCell: (point: Point, type: DrawingObject) => void;

	protected abstract renderRect: (point: Point, w: number, h: number, type: DrawingObject) => void;

	protected abstract renderPresenterLine: (string: string, lineNumber: number) => void;

	protected abstract renderServiceTextLine: (string: string, lineNumber: number) => void;

	constructor(protected width: number, protected height: number) {
		super();
	}

	render = (state: GameState): void => {
		const { snakes, playersStat, winners, bullets, bin } = state;

		if (!this.isInitialized) {
			this.renderMap();
		}

		this.renderSnakes(snakes);
		this.renderCell(state.coin, DrawingObject.Coin);
		this.renderBullets(bullets);
		this.renderServiceInfo(playersStat, winners, snakes);
		this.emptyBin(bin);

		!this.isInitialized && (this.isInitialized = true);
	};

	protected input = (input: PlayerInput): void => {
		state.dispatch(InputActions.setInput(input));
	};

	protected renderServiceInfo(playersStat: PlayersStat[], winners: Player[], snakes: SnakeData[]): void {
		let lineNumber = 1;

		if (winners.length) {
			this.renderServiceTextLine('WINNERS:', lineNumber++);

			for (let i = 0; i < winners.length; i++) {
				this.renderServiceTextLine(`${Player[winners[i]]}`, lineNumber++);
			}

			lineNumber += 2;
		}

		for (let i = 0; i < playersStat.length; i++) {
			const { id, lives, score } = playersStat[i];

			this.renderServiceTextLine(`Player: ${Player[id]}`, lineNumber++);
			this.renderServiceTextLine(`Lives: ${lives}`, lineNumber++);
			this.renderServiceTextLine(`Score: ${score}`, lineNumber);

			lineNumber += 2;
		}

		for (let i = 0; i < snakes.length; i++) {
			const {
				head: { x, y },
				id
			} = snakes[i];

			this.renderServiceTextLine(`HEAD ${Player[id]}: x: ${x}, y: ${y}`, lineNumber++);
		}
	}

	private renderMap = (): void => {
		if (this.drawGrid === DrawGrid.Yes) {
			for (let i = 0; i < this.width; i++) {
				for (let j = 0; j < this.height; j++) {
					this.renderCell({ x: i, y: j }, DrawingObject.Empty);
				}
			}
		} else {
			this.renderRect({ x: 0, y: 0 }, this.width, this.height, DrawingObject.Empty);
		}
	};

	private renderSnakes = (snakes: SnakeData[]): void => {
		for (let i = 0; i < snakes.length; i++) {
			const { id, head, tail } = snakes[i];
			const headType = id === Player.P1 ? DrawingObject.Head1 : DrawingObject.Head2;

			if (!this.isInitialized) {
				let current: Point | undefined = tail;

				while (current) {
					this.renderCell(current, headType);
					current = current.next;
				}
			} else {
				head.prev && this.renderCell(head.prev, DrawingObject.Body);
				head.prev && this.renderCell(head.prev, headType);

				this.renderCell(head, headType);
			}
		}
	};

	private renderBullets = (bulletsArr: Bullet[]): void => {
		// TODO: render bullet tail
		for (let i = 0; i < bulletsArr.length; i++) {
			const { point } = bulletsArr[i];
			this.renderCell(point, DrawingObject.Bullet);
		}
	};

	private emptyBin = (bin: Point[]): void => {
		if (!bin.length) {
			return;
		}

		for (let i = 0; i < bin.length; i++) {
			this.renderCell(bin[i], DrawingObject.Empty);
		}

		state.dispatch(BinActions.emptyBin());
	};
}
