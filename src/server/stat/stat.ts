import { AudioNotifType, GameStatus, Player } from '../../common/enums';
import { Coin } from '../../common/types';
import { Notifier } from '../notifier/notifier';
import { StatStore } from '../redux';
import { Action, ArenaActions, StatActions } from '../redux/actions';
import { State } from '../redux/state';
import {
	DAMAGE_FACTOR,
	DEATH_ENEMY_COIN_AWARD,
	HEAD_SHOT_AWARD,
	KILL_AWARD,
	STANDARD_COIN_AWARD
} from '../utils/constants';
import { DamageType } from '../utils/enums';
import { Hlp } from '../utils/hlp';

export class Stat {
	constructor(private state: State, private notifier: Notifier) {}

	setDamage = (victim: Player, damage: number, damageType?: DamageType): Action[] => {
		const resultDamage = Math.ceil(damage * DAMAGE_FACTOR);

		this.notifier.decScore(resultDamage, victim, damageType);
		return [StatActions.changeScore(-resultDamage, victim)];
	};

	setAward = (killer: Player, damageType: DamageType): void => {
		let award = 0;

		switch (damageType) {
			case DamageType.Death:
				award = KILL_AWARD;
				break;
			case DamageType.HeadShot:
				award = HEAD_SHOT_AWARD;
				break;
			default:
				return;
		}

		this.notifier.incScore(award, killer, damageType);
		this.state.dispatch(StatActions.changeScore(award, killer));
	};

	faceCoins = (id: Player, coins: Coin[]): void => {
		if (!coins.length) {
			return;
		}

		let award = 0;

		for (let i = 0; i < coins.length; i++) {
			const { player } = coins[i];

			if (!player || player === id) {
				award += STANDARD_COIN_AWARD;
				continue;
			}

			award += DEATH_ENEMY_COIN_AWARD;
		}

		this.notifier.incScore(award, id);
		this.notifier.setAudioNotif(AudioNotifType.Coin);
		this.state.dispatch(StatActions.changeScore(award, id));
	};

	judge = (): void => {
		const { playersStat } = this.state.get<StatStore>().stat;

		if (!playersStat.some(({ lives }) => lives === 0)) {
			return;
		}

		const maxScore = Math.max(...Hlp.mapByProp(playersStat, 'score'));
		const winners = Hlp.mapByProp(
			Hlp.filter(playersStat, 'score', maxScore, (item1: number, item2: number) => item1 === item2),
			'id'
		);

		winners.length &&
			this.state.dispatch(ArenaActions.setGameStatus(GameStatus.Finish), StatActions.setWinners(winners));
	};
}
