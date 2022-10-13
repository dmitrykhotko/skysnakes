import {
	BODY_PART_HIT_WEIGHT,
	BODY_PART_RAM_WEIGHT,
	DEC_LIVES,
	FRIENDLY_FIRE_WEIGHT,
	HEAD_SHOT_AWARD,
	KILL_AWARD
} from '../../utils/constants';
import { DamageType, Player } from '../../utils/enums';
import { Action, ArenaActions, StatActions, state, StatStore } from '../redux';

export abstract class StatManager {
	static init = (): void => {
		state.subscribe(this.judge, DEC_LIVES);
	};

	static initScore = (ids: Player[], lives: number): Action[] => {
		return [StatActions.setScore(ids.map(id => ({ id, lives, score: 0 }))), StatActions.setWinners([])];
	};

	static addScore = (killer: Player, victim: Player, damage = 1, damageType = DamageType.ram): Action => {
		let bodyPartWeight = 1;
		let scoreDelta = 0;

		switch (damageType) {
			case DamageType.death:
				scoreDelta += KILL_AWARD;
				break;
			case DamageType.headShot:
				scoreDelta += HEAD_SHOT_AWARD;
				break;
			case DamageType.hit:
				bodyPartWeight = BODY_PART_HIT_WEIGHT;
				break;
			case DamageType.ram:
			default:
				bodyPartWeight = BODY_PART_RAM_WEIGHT;
				break;
		}

		const bodyFactor = bodyPartWeight * (killer === victim ? -FRIENDLY_FIRE_WEIGHT : 1);
		scoreDelta += Math.ceil(damage * bodyFactor);

		return StatActions.addScore(scoreDelta, killer);
	};

	private static judge = (): void => {
		const { playersStat } = state.get<StatStore>().stat;

		if (!playersStat.some(({ lives }) => lives === 0)) {
			return;
		}

		const maxScore = Math.max(...playersStat.map(({ score }) => score));
		const winners = playersStat.filter(stat => stat.score === maxScore).map(({ id }) => id);

		winners.length && state.dispatch(ArenaActions.setInProgress(false), StatActions.setWinners(winners));
	};
}

StatManager.init();
