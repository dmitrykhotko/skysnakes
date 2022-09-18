import { Direction, Player } from '../../utils/enums';
import { comparePoints } from '../../utils/helpers';
import { Point } from '../../utils/types';
import { Snake, SnakeState } from './snake';

export type SnakeData = {
	head: Point;
	direction: Direction;
};

export class Serpentarium {
	private snakesDicto = {} as Record<Player, Snake>;
	private snakes: Snake[] = [];

	constructor(private props: SnakeData[]) {
		this.initSnakes();
	}

	moveHead = (): Record<Player, Point> => {
		const snakes = {} as Record<Player, Point>;

		this.snakes.forEach(snake => {
			snakes[snake.snakeId] = snake.moveHead();
		});

		return snakes;
	};

	moveTail = (ids: Player[]): void => {
		ids.forEach(id => {
			const snake = this.snakesDicto[id];
			snake && snake.moveTail();
		});
	};

	faceBody = (newHead: Point): boolean => {
		let isCrashed = false;

		this.snakes.forEach(({ snakeHead }) => {
			let point: Point | undefined = snakeHead.prev;

			while (point) {
				if (comparePoints(newHead, point)) {
					isCrashed = true;
				}

				point = point.prev;
			}
		});

		return isCrashed;
	};

	getBodiesSet = (width: number): Set<number> => {
		const set: Set<number> = new Set<number>();

		this.snakes.forEach(({ snakeHead }) => {
			let point: Point | undefined = snakeHead;

			while (point) {
				set.add(point.x + point.y * width);
				point = point.prev;
			}
		});

		return set;
	};

	getState = (): Record<Player, SnakeState> =>
		this.snakes.reduce((acc, snake) => {
			acc[snake.snakeId] = snake.getState();
			return acc;
		}, {} as Record<Player, SnakeState>);

	sendDirection = (snakeId: Player, direction: Direction): void => {
		const snake = this.snakesDicto[snakeId];
		snake && snake.sendDirection(direction);
	};

	setHead = (snakeId: Player, head: Point): void => {
		const snake = this.snakesDicto[snakeId];
		snake && (snake.snakeHead = head);
	};

	getPlayers = (): Player[] => this.snakes.map(snake => snake.snakeId);

	private initSnakes = () => {
		this.props.length && this.snakes.push(this.getSnake(Player.P1, this.props[0]));
		this.props.length > 1 && this.snakes.push(this.getSnake(Player.P2, this.props[1]));

		this.snakesDicto = this.snakes.reduce((acc, snake) => {
			acc[snake.snakeId] = snake;
			return acc;
		}, {} as Record<Player, Snake>);
	};

	private getSnake = (player: Player, { head, direction }: SnakeData): Snake => {
		return new Snake(player, head, direction);
	};
}
