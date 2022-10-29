import { COIN_AWARD, DAMAGE_FACTOR, DEC_LIVES, HEAD_SHOT_AWARD, KILL_AWARD } from '../../utils/constants';
import { DamageType, GameStatus, Player } from '../../utils/enums';
import { Action, ArenaActions, StatActions, state, StatStore } from '../redux';

export abstract class Stat {
	static init = (): void => {
		state.subscribe(this.judge, DEC_LIVES);
	};

	static reset = (ids: Player[], lives: number): Action[] => {
		return [StatActions.setScore(ids.map(id => ({ id, lives, score: 0 }))), StatActions.setWinners([])];
	};

	static setDamage = (victim: Player, damage: number): Action[] => {
		return [StatActions.addScore(-Math.ceil(damage * DAMAGE_FACTOR), victim)];
	};

	static setAward = (killer: Player, type: DamageType): Action[] => {
		let award = 0;

		switch (type) {
			case DamageType.death:
				award = KILL_AWARD;
				break;
			case DamageType.headShot:
				award = HEAD_SHOT_AWARD;
				break;
			default:
				break;
		}

		return [StatActions.addScore(award, killer)];
	};

	static faceCoin = (id: Player, num: number): void => {
		state.dispatch(StatActions.addScore(COIN_AWARD * num, id));
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
