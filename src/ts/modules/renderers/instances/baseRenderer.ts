import { DrawGrid, DrawingObject, Player } from '../../../utils/enums';
import { InputActions, state, BinActions } from '../../redux';
import { Bullet, GameState, PlayerInput, PlayersStat, Point, SnakeData } from '../../../utils/types';
import { Renderer } from '../renderer';

export abstract class BaseRenderer extends Renderer {
	protected drawGrid = DrawGrid.No;

	private isInitialized = false;

	protected abstract renderCell: (point: Point, type: DrawingObject) => void;

	protected abstract renderTextLine: (string: string, lineNumber: number) => void;

	constructor(protected width: number, protected height: number) {
		super();
	}

	render(state: GameState): void {
		const { snakes, score, winners, bullets, bin } = state;

		if (!this.isInitialized) {
			this.isInitialized = true;
			this.renderMap();
		}

		this.renderSnakes(snakes);
		this.renderPlayerInfo(score, winners);
		this.renderCell(state.coin, DrawingObject.coin);
		this.renderBullets(bullets);
		this.emptyBin(bin);
	}

	reset(drawGrid: DrawGrid): void {
		this.drawGrid = drawGrid;
		this.isInitialized = false;
	}

	protected input = (input: PlayerInput): void => {
		state.dispatch(InputActions.setInput(input));
	};

	private renderMap = (): void => {
		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				this.renderCell({ x: i, y: j }, DrawingObject.empty);
			}
		}
	};

	private renderPlayerInfo = (wScore: PlayersStat[], winners: Player[]): void => {
		let lineNumber = 1;

		if (winners.length) {
			this.renderTextLine('WINNERS:', lineNumber++);

			for (let i = 0; i < winners.length; i++) {
				this.renderTextLine(`${Player[winners[i]]}`, lineNumber++);
			}

			lineNumber += 2;
		}

		for (let i = 0; i < wScore.length; i++) {
			const { id, lives, score } = wScore[i];

			this.renderTextLine(`Player: ${Player[id]}`, lineNumber++);
			this.renderTextLine(`Lives: ${lives}`, lineNumber++);
			this.renderTextLine(`Score: ${score}`, lineNumber);

			lineNumber += 2;
		}
	};

	private renderSnakes = (snakes: SnakeData[]): void => {
		for (let i = 0; i < snakes.length; i++) {
			const { id, head, tail } = snakes[i];
			let current = tail;

			while (current !== head) {
				this.renderCell(current, DrawingObject.body);
				current.next && (current = current.next);
			}

			const headType = id === Player.P1 ? DrawingObject.head1 : DrawingObject.head2;
			this.renderCell(current, headType);
		}
	};

	private renderBullets = (bulletsArr: Bullet[]): void => {
		// TODO: render bullet tail
		for (let i = 0; i < bulletsArr.length; i++) {
			const { point } = bulletsArr[i];
			this.renderCell(point, DrawingObject.bullet);
		}
	};

	private emptyBin = (bin: Point[]): void => {
		if (!bin.length) {
			return;
		}

		for (let i = 0; i < bin.length; i++) {
			this.renderCell(bin[i], DrawingObject.empty);
		}

		state.dispatch(BinActions.emptyBin());
	};
}
