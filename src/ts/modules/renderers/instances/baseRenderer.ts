import { DrawGrid, Player } from '../../../utils/enums';
import { InputActions, state, BinActions } from '../../redux';
import { Bullet, GameState, PlayerInput, Point, SnakeData, WeightedScore } from '../../../utils/types';
import { Renderer } from '../renderer';

export enum DrawingObject {
	empty = 1,
	head1 = 2,
	head2 = 3,
	body = 4,
	coin = 5,
	grid = 6,
	bullet = 7
}

export abstract class BaseRenderer extends Renderer {
	protected drawGrid = DrawGrid.No;

	private isInitialized = false;

	protected abstract renderCell: (point: Point, type: DrawingObject) => void;

	protected abstract renderTextLine: (string: string, lineNumber: number) => void;

	constructor(protected width: number, protected height: number) {
		super();
	}

	render(state: GameState): void {
		const { snakes, score, loosers, bullets, bin } = state;

		if (!this.isInitialized) {
			this.isInitialized = true;
			this.renderMap();
		}

		this.renderSnakes(snakes);
		this.renderPlayerInfo(score, loosers);
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

	private renderPlayerInfo = (wScore: WeightedScore[], loosers: Player[]): void => {
		let lineNumber = 1;

		if (loosers.length) {
			this.renderTextLine(`LOOSER${loosers.length > 1 ? 'S' : ''}:`, lineNumber++);

			for (let i = 0; i < loosers.length; i++) {
				this.renderTextLine(`${Player[loosers[i]]}`, lineNumber++);
			}

			lineNumber += 2;
		}

		for (let i = 0; i < wScore.length; i++) {
			const { id, deaths, score } = wScore[i];

			this.renderTextLine(`Player: ${Player[id]}`, lineNumber++);
			this.renderTextLine(`Deaths: ${deaths}`, lineNumber++);
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
