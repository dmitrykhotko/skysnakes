import { Direction, NotifType, Player } from '../../common/enums';
import { LinkedPoint } from '../../common/types';
import { Snakes } from '../arena/characters/snakes';
import { StatActions } from '../redux/actions';
import { State } from '../redux/state';
import {
	FACE_COIN_AWARD_LIFETIME,
	NEGATIVE_OFFSET_X,
	NEGATIVE_OFFSET_Y,
	POSITIVE_OFFSET_X,
	POSITIVE_OFFSET_Y
} from '../utils/constants';
import { DelayedTasks } from '../utils/delayedTasks';
import { DamageType } from '../utils/enums';
import { Hlp } from '../utils/hlp';
import { DEATH_FUN_PRINT, KILL_FUN_PRINT } from '../utils/labels';

export class Notifier {
	constructor(private state: State) {}

	incScore = (award: number, id: Player, damageType?: DamageType): void => {
		const { head, direction } = Snakes.getById(this.state, id);
		const funPrint = this.isDead(damageType) ? `  ${KILL_FUN_PRINT}` : '';

		this.changeScore(head, direction, `+${award}${funPrint}`, NotifType.IncScore);
	};

	decScore = (award: number, id: Player, damageType?: DamageType): void => {
		const { head, tail, direction } = Snakes.getById(this.state, id);
		const showOnTail = damageType !== DamageType.HeadShot;
		const funPrint = this.isDead(damageType) ? `  ${DEATH_FUN_PRINT}` : '';

		this.changeScore(showOnTail ? tail : head, direction, `-${award}${funPrint}`, NotifType.DecScore);
	};

	private isDead = (damageType?: DamageType): boolean =>
		damageType === DamageType.Death || damageType === DamageType.HeadShot;

	private changeScore = (point: LinkedPoint, direction: Direction, value: string, type: NotifType): void => {
		const [x, y] = point;
		const { width, height } = Hlp.getSize(this.state);
		const id = Hlp.id();

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

		this.state.dispatch(
			StatActions.addNotification({
				id,
				t: type,
				v: value,
				p: [newX, newY]
			})
		);

		DelayedTasks.delay(() => {
			this.state.dispatch(StatActions.removeNotification(id));
		}, FACE_COIN_AWARD_LIFETIME);
	};
}
