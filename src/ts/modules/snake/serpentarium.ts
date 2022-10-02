import { Direction, Player } from '../../utils/enums';
import { comparePoints } from '../../utils/helpers';
import { Point } from '../../utils/types';
import { Snake } from './snake';

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

	move = (): Record<Player, Point> => {
		const snakes = {} as Record<Player, Point>;

		for (let i = 0; i < this.snakes.length; i++) {
			const snake = this.snakes[i];
			snakes[snake.snakeId] = snake.move();
		}

		return snakes;
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

	getPlayers = (): Player[] => this.snakes.map(snake => snake.snakeId);

	grow = (snakeId: Player): void => {
		this.snakesDicto[snakeId].grow();
	};

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
