import { Direction, Point, SnakeState } from '../../snake/snake';

export enum CellType {
	empty = '-',
	snake = '*',
	coin = '?'
}

export abstract class BasePresenter {
	private static inputMapping: Record<string, Direction> = {
		ArrowUp: Direction.Up,
		ArrowDown: Direction.Down,
		ArrowLeft: Direction.Left,
		ArrowRight: Direction.Right
	};

	private onInputCb?: (input: Direction) => void;
	private drawServiceInfoFlag = false;

	protected abstract clear: () => void;
	protected abstract printField: (field: string[][]) => void;
	protected abstract printServiceInfo: (info: string[]) => void;

	constructor(
		protected element: HTMLElement
	) {
		this.init();
	}

	draw = (state: SnakeState): void => {
		const field = this.buildMap(state);

		this.clear();
		this.drawServiceInfo(state.serviceInfo);
		this.printField(field);
	}

	setServiceInfoFlag = (flag: boolean): void => {
		this.drawServiceInfoFlag = flag;
	}

	onInput = (cb: (input: Direction) => void): void => {
		this.onInputCb = cb;
	}

	private init = () => {
		this.element.addEventListener('keydown', this.onKeyDown);
	}

	private drawServiceInfo = (serviceInfo?: Record<string, string>) => {
		if (!(this.drawServiceInfoFlag && serviceInfo)) {
			return;
		}

		const data = Object.entries(serviceInfo);

		if (!data.length) {
			return;
		}

		const info: string[] = [];

		for (let i = 0; i < data.length; i++) {
			const [key, value] = data[i];
			info.push(`${key}: ${value}`);
		}

		this.printServiceInfo(info);
	}

	private onKeyDown = ({ key }: KeyboardEvent) => {
		const input = BasePresenter.inputMapping[key];
		input !== undefined && this.onInputCb && this.onInputCb(input);
	}

	private buildMap = (state: SnakeState): string[][] => {
		const { width, height, coin, head, tail } = state;
		const field = [];

		for (let i = 0; i < height; i++) {
			const row = [] as string[];
			field.push(row);

			for (let j = 0; j < width; j++) {
				row.push(CellType.empty);
			}
		}

		field[coin.y][coin.x] = CellType.coin;
		this.buildSnake(head, tail, field);

		return field;
	};

	private buildSnake = (head: Point, tail: Point, field: string[][]) => {
		let current = tail;

		while (true) {
			field[current.y][current.x] = CellType.snake;

			if (current === head) {
				break;
			}

			current.next && (current = current.next);
		}
	}
}
