import { SEND_DIRECTION } from '../../../utils/constants';
import { Direction, Player } from '../../../utils/enums';
import { comparePoints } from '../../../utils/helpers';
import { Point } from '../../../utils/types';
import { SnakesStore, state } from '../../redux';
import { Snake } from './snake';

export type SnakeData = {
	head: Point;
	direction: Direction;
};

export class Serpentarium {
	private snakesDicto = {} as Record<Player, Snake>;
	private snakes!: Snake[];

	constructor(private props: SnakeData[]) {
		this.initSnakes();
	}

	move = (): void => {
		for (let i = 0; i < this.snakes.length; i++) {
			this.snakes[i].move();
		}
	};

	faceBody = (newHead: Point): boolean => {
		let isCrashed = false;
		const snakes = Object.values((state.get() as SnakesStore).snakes);

		for (let i = 0; i < snakes.length; i++) {
			let point: Point | undefined = snakes[i].head.prev;

			while (point) {
				if (comparePoints(newHead, point)) {
					isCrashed = true;
				}

				point = point.prev;
			}
		}

		return isCrashed;
	};

	getBodiesSet = (width: number): Set<number> => {
		const set: Set<number> = new Set<number>();
		const snakes = Object.values((state.get() as SnakesStore).snakes);

		snakes.forEach(({ head }) => {
			let point: Point | undefined = head;

			while (point) {
				set.add(point.x + point.y * width);
				point = point.prev;
			}
		});

		return set;
	};

	getPlayers = (): Player[] => this.snakes.map(snake => snake.id);

	grow = (snakeId: Player): void => {
		this.snakesDicto[snakeId].grow();
	};

	private initSnakes = (): void => {
		state.reset(SEND_DIRECTION);

		this.snakes = [];
		this.props.length && this.snakes.push(this.getSnake(Player.P1, this.props[0]));
		this.props.length > 1 && this.snakes.push(this.getSnake(Player.P2, this.props[1]));

		this.snakesDicto = this.snakes.reduce((acc, snake) => {
			acc[snake.id] = snake;
			return acc;
		}, {} as Record<Player, Snake>);
	};

	private getSnake = (player: Player, { head, direction }: SnakeData): Snake => {
		return new Snake(player, head, direction);
	};
}