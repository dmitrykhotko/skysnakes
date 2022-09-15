import { Player } from '../../../utils/enums';
import { Point } from '../../../utils/types';
import { ArenaState } from '../../arena/arena';
import { SnakeState } from '../../snake/snake';
import { Renderer } from '../renderer';

export enum CellType {
	empty = 1,
	head1 = 2,
	head2 = 3,
	body = 4,
	coin = 5
}

export abstract class BaseRenderer extends Renderer {
	private isInitialized = false;
	private arenaPrevState?: ArenaState;

	protected abstract renderCell: (point: Point, type: CellType) => void;
	protected abstract renderTextLine: (string: string, lineNumber: number) => void;

	constructor(protected width: number, protected height: number) {
		super();
	}

	render = (state: ArenaState): void => {
		if (!this.isInitialized) {
			this.isInitialized = true;
			this.renderMap();
		}

		let linesNum = 0;

		Object.values(state.snakes).forEach(state => {
			this.renderServiceInfo(state.serviceInfo, linesNum);
			this.renderItems(state, this.arenaPrevState?.snakes[state.id]);

			linesNum += Object.keys(state.serviceInfo).length + 1;
		});

		linesNum++;

		this.renderTextLine('DEATHS:', linesNum++);
		Object.entries(state.score).forEach(([player, score]) => {
			this.renderTextLine(`${Player[parseInt(player) as Player]}: ${score}`, linesNum++);
		});

		this.renderCoin(state.coin, this.arenaPrevState);
		this.arenaPrevState = state;
	};

	reset(): void {
		this.isInitialized = false;
		this.arenaPrevState = undefined;
	}

	private renderServiceInfo = (serviceInfo: Record<string, string>, line = 0): void => {
		const data = Object.entries(serviceInfo);

		for (let i = 0; i < data.length; i++) {
			const [key, value] = data[i];
			this.renderTextLine(`${key}: ${value}`, line + i + 1);
		}
	};

	private renderMap = (): void => {
		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				this.renderCell({ x: i, y: j }, CellType.empty);
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

			this.renderCell(current, CellType.body);
			current.next && (current = current.next);
		}
	};

	private renderItems(state: SnakeState, prevState?: SnakeState): void {
		const { id, head, tail } = state;

		if (prevState) {
			const { head: prevHead, tail: prevTail } = prevState;
			const headType = this.getHeadType(id);

			this.rerenderCell({ p1: prevHead, p2: head, t1: CellType.body, t2: headType });
			this.rerenderCell({ p1: prevTail, p2: tail, t1: CellType.empty });
		} else {
			this.renderSnake(id, head, tail);
		}
	}

	private renderCoin = (coin: Point, prevState?: ArenaState): void => {
		if (prevState) {
			this.rerenderCell({ p1: prevState.coin, p2: coin, t2: CellType.coin });
		} else {
			this.renderCell(coin, CellType.coin);
		}
	};

	private getHeadType = (id: Player): CellType => (id === Player.P1 ? CellType.head1 : CellType.head2);

	private rerenderCell({ p1, p2, t1, t2 }: { p1: Point; p2: Point; t1?: CellType; t2?: CellType }): void {
		if (p1.x === p2.x && p1.y === p2.y) {
			return;
		}

		t1 && this.renderCell(p1, t1);
		t2 && this.renderCell(p2, t2);
	}
}
