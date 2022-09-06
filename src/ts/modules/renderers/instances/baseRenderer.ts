import { Direction, Point, SnakeState } from '../../snake/snake';
import { Renderer } from '../renderer';

export enum CellType {
	empty = '-',
	head = '@',
	body = '*',
	coin = '?'
}

export abstract class BaseRenderer implements Renderer {
	private onInputCb?: (input: Direction) => void;
	private isInitialized = false;
	private prevSnakeState?: SnakeState;

	protected abstract renderCell: (point: Point, type: CellType) => void;
	protected abstract renderTextLine: (string: string, lineNumber: number) => void;

	constructor(
		protected width: number,
		protected height: number
	) {
	}

	render = (state: SnakeState): void => {
		if (!this.isInitialized) {
			this.isInitialized = true;
			this.renderMap();
		}

		this.renderServiceInfo(state.serviceInfo);
		this.renderItems(state);

		this.prevSnakeState = state;
	}

	input = (direction: Direction): void => {
		this.onInputCb && this.onInputCb(direction);
	}

	onInput = (cb: (input: Direction) => void): void => {
		this.onInputCb = cb;
	}

	private renderServiceInfo = (serviceInfo?: Record<string, string>): void => {
		if (!serviceInfo) {
			return;
		}

		const data = Object.entries(serviceInfo);

		for (let i = 0; i < data.length; i++) {
			const [key, value] = data[i];
			this.renderTextLine(`${key}: ${value}`, i + 1);
		}
	}

	private renderMap = (): void => {
		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				this.renderCell({ x: i, y: j }, CellType.empty);
			}
		}
	};

	private renderSnake = (head: Point, tail: Point): void => {
		let current = tail;

		while (true) {
			if (current === head) {
				return this.renderCell(current, CellType.head);
			}

			this.renderCell(current, CellType.body);
			current.next && (current = current.next);
		}
	}

	private renderItems({ head, tail, coin }: SnakeState): void {
		if (this.prevSnakeState) {
			const { head: prevHead, tail: prevTail, coin: prevCoin } = this.prevSnakeState;

			this.rerenderCell({ p1: prevCoin, p2: coin, t2: CellType.coin });
			this.rerenderCell({ p1: prevHead, p2: head, t1: CellType.body, t2: CellType.head });
			this.rerenderCell({ p1: prevTail, p2: tail, t1: CellType.empty });
		} else {
			this.renderSnake(head, tail);
			this.renderCell(coin, CellType.coin);
		}
	}

	private rerenderCell({ p1, p2, t1, t2 }: { p1: Point, p2: Point, t1?: CellType, t2?: CellType}): void {
		if (p1.x === p2.x && p1.y === p2.y) {
			return;
		}

		t1 && this.renderCell(p1, t1);
		t2 && this.renderCell(p2, t2);
	}
}
