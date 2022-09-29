import { DrawGrid, MoveInput, Player } from '../../../utils/enums';
import { InputActions as actions, state } from '../../redux';
import { Point, SnakeState } from '../../../utils/types';
import { ArenaState } from '../../arena/arena';
import { Renderer } from '../renderer';

export enum DrawingObject {
	empty = 1,
	head1 = 2,
	head2 = 3,
	body = 4,
	coin = 5,
	grid = 6
}

export abstract class BaseRenderer extends Renderer {
	protected drawGrid = DrawGrid.No;

	private isInitialized = false;
	private arenaPrevState?: ArenaState;

	protected abstract renderCell: (point: Point, type: DrawingObject) => void;
	protected abstract renderTextLine: (string: string, lineNumber: number) => void;

	constructor(protected width: number, protected height: number) {
		super();
	}

	render = (state: ArenaState): void => {
		const { snakes, score, loosers } = state;
		let lineNumber = 1;

		if (!this.isInitialized) {
			this.isInitialized = true;
			this.renderMap();
		}

		if (loosers.length) {
			this.renderTextLine(`LOOSER${loosers.length > 1 ? 'S' : ''}:`, lineNumber++);
			loosers.forEach(looser => {
				this.renderTextLine(`${Player[looser]}`, lineNumber++);
			});

			lineNumber += 2;
		}

		this.renderTextLine('SCORE:', lineNumber++);

		Object.entries(score).forEach(([player, { deaths, coins }]) => {
			this.renderTextLine(`Player: ${Player[+player as Player]}`, lineNumber++);
			this.renderTextLine(`Deaths: ${deaths}`, lineNumber++);
			this.renderTextLine(`Coins: ${coins}`, lineNumber);

			lineNumber += 2;
		});

		Object.entries(snakes).forEach(([player, snake]) => {
			const id = +player as Player;
			this.renderItems(id, snake, this.arenaPrevState?.snakes[id]);
		});

		this.renderCoin(state.coin, this.arenaPrevState);
		this.arenaPrevState = state;
	};

	reset(drawGrid: DrawGrid): void {
		this.drawGrid = drawGrid;
		this.isInitialized = false;
		this.arenaPrevState = undefined;
	}

	protected input = (input: MoveInput): void => {
		state.dispatch(actions.setMoveInput(input));
	};

	private renderMap = (): void => {
		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				this.renderCell({ x: i, y: j }, DrawingObject.empty);
			}
		}
	};

	private renderSnake = (id: Player, head: Point, tail: Point): void => {
		let current = tail;

		while (true) {
			if (current === head) {
				const headType = this.getHeadType(id);
				return this.renderCell(current, headType);
			}

			this.renderCell(current, DrawingObject.body);
			current.next && (current = current.next);
		}
	};

	private renderItems(id: Player, state: SnakeState, prevState?: SnakeState): void {
		const { head, tail } = state;

		if (prevState) {
			const { head: prevHead, tail: prevTail } = prevState;
			const headType = this.getHeadType(id);

			this.rerenderCell({ p1: prevHead, p2: head, t1: DrawingObject.body, t2: headType });
			this.rerenderCell({ p1: prevTail, p2: tail, t1: DrawingObject.empty });
		} else {
			this.renderSnake(id, head, tail);
		}
	}

	private renderCoin = (coin: Point, prevState?: ArenaState): void => {
		if (prevState) {
			this.rerenderCell({ p1: prevState.coin, p2: coin, t2: DrawingObject.coin });
		} else {
			this.renderCell(coin, DrawingObject.coin);
		}
	};

	private getHeadType = (id: Player): DrawingObject => (id === Player.P1 ? DrawingObject.head1 : DrawingObject.head2);

	private rerenderCell({ p1, p2, t1, t2 }: { p1: Point; p2: Point; t1?: DrawingObject; t2?: DrawingObject }): void {
		if (p1.x === p2.x && p1.y === p2.y) {
			return;
		}

		t1 && this.renderCell(p1, t1);
		t2 && this.renderCell(p2, t2);
	}
}
