import {
	STANDARD_COIN_AWARD,
	DAMAGE_FACTOR,
	DEC_LIVES,
	HEAD_SHOT_AWARD,
	KILL_AWARD,
	DEATH_ENEMY_COIN_AWARD
} from '../../utils/constants';
import { DamageType, GameStatus, Player } from '../../utils/enums';
import { Notifier } from '../../utils/notifier';
import { Coin } from '../../utils/types';
import { Action, ArenaActions, StatActions, state, StatStore } from '../redux';

export abstract class Stat {
	static init = (): void => {
		state.subscribe(this.judge, DEC_LIVES);
	};

	static setDamage = (victim: Player, damage: number, damageType?: DamageType): Action[] => {
		const resultDamage = Math.ceil(damage * DAMAGE_FACTOR);
		const showOnTail = damageType !== DamageType.headShot;

		Notifier.decScore(resultDamage, victim, showOnTail);
		return [StatActions.changeScore(-resultDamage, victim)];
	};

	static setAward = (killer: Player, type: DamageType): void => {
		let award = 0;

		switch (type) {
			case DamageType.death:
				award = KILL_AWARD;
				break;
			case DamageType.headShot:
				award = HEAD_SHOT_AWARD;
				break;
			default:
				return;
		}

		Notifier.incScore(award, killer);
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

		const maxScore = Math.max(...playersStat.map(({ score }) => score));
		const winners = playersStat.filter(stat => stat.score === maxScore).map(({ id }) => id);

		winners.length && state.dispatch(ArenaActions.setGameStatus(GameStatus.Stop), StatActions.setWinners(winners));
	};
}

Stat.init();
