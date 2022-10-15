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

export type AddScoreProps = {
	killer: Player;
	victim: Player;
	damage?: number;
	damageType?: DamageType;
	symDamage?: boolean;
};

const addScoreDefaultProps = {
	damage: 1,
	damageType: DamageType.ram,
	symDamage: false
};

export abstract class Stat {
	static init = (): void => {
		state.subscribe(this.judge, DEC_LIVES);
	};

	static reset = (ids: Player[], lives: number): Action[] => {
		return [StatActions.setScore(ids.map(id => ({ id, lives, score: 0 }))), StatActions.setWinners([])];
	};

	static addScore = (props: AddScoreProps): Action[] => {
		const { killer, victim, damage, damageType, symDamage } = { ...addScoreDefaultProps, ...props };
		const isFriendlyFire = killer === victim;

		let bodyPartWeight = 1;
		let awards = 0;

		switch (damageType) {
			case DamageType.death:
				awards += KILL_AWARD;
				break;
			case DamageType.headShot:
				awards += HEAD_SHOT_AWARD;
				break;
			case DamageType.hit:
				bodyPartWeight = BODY_PART_HIT_WEIGHT;
				break;
			case DamageType.ram:
			default:
				bodyPartWeight = BODY_PART_RAM_WEIGHT;
				break;
		}

		const bodyFactor = bodyPartWeight * (isFriendlyFire ? -FRIENDLY_FIRE_WEIGHT : 1);
		const scoreDelta = Math.ceil(damage * bodyFactor);

		const actions = [StatActions.addScore(scoreDelta + awards, killer)];
		symDamage && actions.push(StatActions.addScore(-scoreDelta, victim));

		return actions;
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

Stat.init();
