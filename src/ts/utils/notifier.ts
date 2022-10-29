import { Snakes } from '../modules/arena/characters/snakes';
import { StatActions, state } from '../modules/redux';
import {
	FACE_COIN_AWARD_LIFETIME,
	NEGATIVE_OFFSET_X,
	NEGATIVE_OFFSET_Y,
	POSITIVE_OFFSET_X,
	POSITIVE_OFFSET_Y
} from './constants';
import { DelayedTasks } from './delayedTasks';
import { Direction, NotifType, Player } from './enums';
import { Hlp } from './hlp';
import { Point } from './types';

export abstract class Notifier {
	static incScore = (award: number, id: Player): void => {
		const { head, direction } = Snakes.getById(id);
		this.changeScore(head, direction, `+${award}`, NotifType.IncScore);
	};

	static decScore = (award: number, id: Player, showOnTail = false): void => {
		const { head, tail, direction } = Snakes.getById(id);
		this.changeScore(showOnTail ? tail : head, direction, `-${award}`, NotifType.DecScore);
	};

	private static changeScore = (point: Point, direction: Direction, value: string, type: NotifType): void => {
		const { x, y } = point;
		const { width, height } = Hlp.getSize();
		const id = Hlp.generateId();

		let newX = x;
		let newY = y;

		if (direction === Direction.Up || direction === Direction.Down) {
			newX += x + POSITIVE_OFFSET_X < width - POSITIVE_OFFSET_X ? POSITIVE_OFFSET_X : NEGATIVE_OFFSET_X;
			newY += y < height - POSITIVE_OFFSET_Y ? 0 : NEGATIVE_OFFSET_Y;
		}

		if (direction === Direction.Left || direction === Direction.Right) {
			newX += x < width - POSITIVE_OFFSET_X ? 0 : NEGATIVE_OFFSET_X;
			newY += y + NEGATIVE_OFFSET_Y < -NEGATIVE_OFFSET_Y ? POSITIVE_OFFSET_Y : NEGATIVE_OFFSET_Y;
		}

		state.dispatch(
			StatActions.addNotification({
				id,
				type,
				value,
				point: { x: newX, y: newY }
			})
		);

		DelayedTasks.delay(() => {
			state.dispatch(StatActions.removeNotification(id));
		}, FACE_COIN_AWARD_LIFETIME);
	};
}
