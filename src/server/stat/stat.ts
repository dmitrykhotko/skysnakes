import { GameStatus, Player } from '../../common/enums';
import { Coin } from '../../common/types';
import { Action, ArenaActions, StatActions, state, StatStore } from '../redux';
import {
	DAMAGE_FACTOR,
	DEATH_ENEMY_COIN_AWARD,
	DEC_LIVES,
	HEAD_SHOT_AWARD,
	KILL_AWARD,
	STANDARD_COIN_AWARD
} from '../utils/constants';
import { DamageType } from '../utils/enums';
import { Hlp } from '../utils/hlp';
import { Notifier } from '../utils/notifier';

export abstract class Stat {
	static init = (): void => {
		state.subscribe(this.judge, DEC_LIVES);
	};

	static setDamage = (victim: Player, damage: number, damageType?: DamageType): Action[] => {
		const resultDamage = Math.ceil(damage * DAMAGE_FACTOR);

		Notifier.decScore(resultDamage, victim, damageType);
		return [StatActions.changeScore(-resultDamage, victim)];
	};

	static setAward = (killer: Player, damageType: DamageType): void => {
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

		Notifier.incScore(award, killer, damageType);
		state.dispatch(StatActions.changeScore(award, killer));
	};

	static faceCoins = (id: Player, coins: Coin[]): void => {
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

		Notifier.incScore(award, id);
		state.dispatch(StatActions.changeScore(award, id));
	};

	private static judge = (): void => {
		const { playersStat } = state.get<StatStore>().stat;

		if (!playersStat.some(({ lives }) => lives === 0)) {
			return;
		}

		const maxScore = Math.max(...Hlp.mapByProp(playersStat, 'score'));
		const winners = Hlp.mapByProp(
			Hlp.filter(playersStat, 'score', maxScore, (item1: number, item2: number) => item1 === item2),
			'id'
		);

		winners.length && state.dispatch(ArenaActions.setGameStatus(GameStatus.Stop), StatActions.setWinners(winners));
	};
}

Stat.init();
