import { ActionInput, DrawGrid, MoveInput, Player } from '../../../utils/enums';
import { ShootingActions, InputActions, state } from '../../redux';
import { GameState, PlayerInput, Point, Score, SnakeState } from '../../../utils/types';
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
	private gameStatePrev?: GameState;

	protected abstract renderCell: (point: Point, type: DrawingObject) => void;
	protected abstract renderTextLine: (string: string, lineNumber: number) => void;

	constructor(protected width: number, protected height: number) {
		super();
	}

	render(state: GameState): void {
		const { snakes, score, loosers, bullets } = state;
		const bulletsArr = Object.entries(bullets);

		if (!this.isInitialized) {
			this.isInitialized = true;
			this.renderMap();
		}

		this.renderSnakes(snakes);
		this.renderPlayerInfo(score, loosers);
		this.renderPoint(state.coin, DrawingObject.coin, this.gameStatePrev?.coin);

		for (let i = 0; i < bulletsArr.length; i++) {
			const [id, { point }] = bulletsArr[i];
			this.renderPoint(point, DrawingObject.bullet, this.gameStatePrev?.bullets[+id]?.point);
		}

		this.gameStatePrev = state;
	}

	reset(drawGrid: DrawGrid): void {
		this.drawGrid = drawGrid;
		this.isInitialized = false;
		this.gameStatePrev = undefined;
	}

	protected input = (input: PlayerInput): void => {
		if (MoveInput[input]) {
			state.dispatch(InputActions.setMoveInput(input as MoveInput));
		}

		if (ActionInput[input]) {
			state.dispatch(ShootingActions.fire(input as ActionInput));
		}
	};

	private renderMap = (): void => {
		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				this.renderCell({ x: i, y: j }, DrawingObject.empty);
			}
		}
	};

	private renderPlayerInfo = (score: Record<Player, Score>, loosers: Player[]): void => {
		let lineNumber = 1;

		if (loosers.length) {
			this.renderTextLine(`LOOSER${loosers.length > 1 ? 'S' : ''}:`, lineNumber++);

			for (let i = 0; i < loosers.length; i++) {
				this.renderTextLine(`${Player[loosers[i]]}`, lineNumber++);
			}

			lineNumber += 2;
		}

		this.renderTextLine('SCORE:', lineNumber++);

		const scoreArray = Object.entries(score);

		for (let i = 0; i < scoreArray.length; i++) {
			const [player, { deaths, coins }] = scoreArray[i];

			this.renderTextLine(`Player: ${Player[+player as Player]}`, lineNumber++);
			this.renderTextLine(`Deaths: ${deaths}`, lineNumber++);
			this.renderTextLine(`Coins: ${coins}`, lineNumber);

			lineNumber += 2;
		}
	};

	private renderSnakes = (snakes: Record<Player, SnakeState>): void => {
		const snakesArray = Object.entries(snakes);

		for (let i = 0; i < snakesArray.length; i++) {
			const [player, { head, tail }] = snakesArray[i];
			const id = +player as Player;
			const prevState = this.gameStatePrev?.snakes[id];

			if (prevState) {
				const { head: prevHead, tail: prevTail } = prevState;
				const headType = this.getHeadType(id);

				this.rerenderCell({ p1: prevHead, p2: head, t1: DrawingObject.body, t2: headType });
				this.rerenderCell({ p1: prevTail, p2: tail, t1: DrawingObject.empty });
			} else {
				let current = tail;

				while (current === head) {
					this.renderCell(current, DrawingObject.body);
					current.next && (current = current.next);
				}

				const headType = this.getHeadType(id);
				this.renderCell(current, headType);
			}
		}
	};

	private getHeadType = (id: Player): DrawingObject => (id === Player.P1 ? DrawingObject.head1 : DrawingObject.head2);

	private renderPoint = (point: Point, drawingObject: DrawingObject, prevPoint?: Point): void => {
		if (prevPoint) {
			this.rerenderCell({ p1: prevPoint, p2: point, t1: DrawingObject.empty, t2: drawingObject });
		} else {
			this.renderCell(point, drawingObject);
		}
	};

	private rerenderCell({ p1, p2, t1, t2 }: { p1: Point; p2: Point; t1?: DrawingObject; t2?: DrawingObject }): void {
		if (p1.x === p2.x && p1.y === p2.y) {
			return;
		}

		t1 && this.renderCell(p1, t1);
		t2 && this.renderCell(p2, t2);
	}
}
