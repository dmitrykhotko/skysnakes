import { Direction, Player } from '../../../utils/enums';
import { comparePoints, nextPointCreator } from '../../../utils/helpers';
import { Point } from '../../../utils/types';
import { Action, BinActions, SnakesActions, SnakesStore, state } from '../../redux';
import { SnakeState } from '../../redux/reducers/instances/snakes';

const directionWeights = {
	[Direction.Up]: -1,
	[Direction.Down]: 1,
	[Direction.Left]: -2,
	[Direction.Right]: 2
};

export abstract class Snake {
	static move = (id: Player, shouldMoveTail: (id: Player, head: Point) => boolean): void => {
		const data = this.getState(id);
		const actions = [] as Action[];
		let { head, tail, direction } = data;

		direction = this.applyDirection(data);

		const nextHead = nextPointCreator[direction](head);

		nextHead.prev = head;
		head.next = nextHead;
		head = nextHead;

		if (shouldMoveTail(id, head)) {
			actions.push(BinActions.moveToBin([tail]));

			tail.next && (tail = tail.next);
			tail.prev = undefined;
		}

		state.dispatch(SnakesActions.setSnake({ id, head, tail, direction }), ...actions);
	};

	static faceObject = (id: Player, object: Point, skipHead = true): Point | undefined => {
		const { head } = this.getState(id);

		let point: Point | undefined;

		point = skipHead ? head.prev : head;

		while (point) {
			if (comparePoints(object, point)) {
				break;
			}

			point = point.prev;
		}

		return point;
	};

	static initBody = (head: Point, length: number, direction: Direction): Point => {
		const D = Direction;
		const xStep = direction === D.Left ? 1 : direction === D.Right ? -1 : 0;
		const yStep = direction === D.Up ? 1 : direction === D.Down ? -1 : 0;

		let point: Point = { x: head.x + xStep, y: head.y + yStep };

		head.prev = point;
		point.next = head;

		for (let i = 0; i < length - 2; i++) {
			const newPoint: Point = { x: point.x + xStep, y: point.y + yStep };

			point.prev = newPoint;
			newPoint.next = point;
			point = newPoint;
		}

		const tail = point;

		return tail;
	};

	private static getState = (id: Player): SnakeState => state.get<SnakesStore>().snakes[id];

	private static applyDirection = (data: SnakeState): Direction => {
		const { id, direction, newDirection } = data;

		if (!(newDirection && directionWeights[direction] + directionWeights[newDirection])) {
			return direction;
		}

		state.dispatch(SnakesActions.newDirection(undefined, id));

		return newDirection;
	};
}
