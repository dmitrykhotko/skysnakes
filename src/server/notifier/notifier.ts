import { AudioNotifType, Direction, Player, VisualNotifType } from '../../common/enums';
import { LinkedPoint, NotifsState } from '../../common/types';
import { Snakes } from '../arena/characters/snakes';
import { NotifsActions } from '../redux/actions';
import { State } from '../redux/state';
import { NEGATIVE_OFFSET_X, NEGATIVE_OFFSET_Y, POSITIVE_OFFSET_X, POSITIVE_OFFSET_Y } from '../utils/constants';
import { DamageType } from '../utils/enums';
import { Hlp } from '../utils/hlp';
import { DEATH_FUN_PRINT, KILL_FUN_PRINT } from '../utils/labels';

export class Notifier {
	constructor(private state: State) {}

	incScore = (award: number, id: Player, damageType?: DamageType): void => {
		const { head, direction } = Snakes.getById(this.state, id);
		const funPrint = this.isDead(damageType) ? `  ${KILL_FUN_PRINT}` : '';

		this.changeScore(head, direction, `+${award}${funPrint}`, VisualNotifType.IncScore);
	};

	decScore = (award: number, id: Player, damageType?: DamageType): void => {
		const { head, tail, direction } = Snakes.getById(this.state, id);
		const showOnTail = damageType !== DamageType.HeadShot;
		const funPrint = this.isDead(damageType) ? `  ${DEATH_FUN_PRINT}` : '';

		this.changeScore(showOnTail ? tail : head, direction, `-${award}${funPrint}`, VisualNotifType.DecScore);
	};

	setAudioNotif = (type: AudioNotifType): void => {
		const notifs = this.state.get<NotifsState>().audio || [];
		let isUnique = true;

		for (let i = 0; i < notifs.length; i++) {
			if (notifs[i].type === type) {
				isUnique = false;
				break;
			}
		}

		isUnique &&
			this.state.dispatch(
				NotifsActions.addAudioNotif({
					id: Hlp.id(),
					type
				})
			);
	};

	private isDead = (damageType?: DamageType): boolean =>
		damageType === DamageType.Death || damageType === DamageType.HeadShot;

	private changeScore = (point: LinkedPoint, direction: Direction, value: string, type: VisualNotifType): void => {
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
			NotifsActions.addVisualNotif({
				id,
				type,
				value,
				point: [newX, newY]
			})
		);
	};
}
