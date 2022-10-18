import {
	BODY_PART_HIT_WEIGHT,
	BODY_PART_RAM_WEIGHT,
	COIN_AWARD,
	DEC_LIVES,
	FRIENDLY_FIRE_WEIGHT,
	HEAD_SHOT_AWARD,
	KILL_AWARD,
	SYM_DAMAGE_WEIGHT
} from '../../utils/constants';
import { DamageType, GameStatus, Player } from '../../utils/enums';
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

	static setDamage = (props: AddScoreProps): Action[] => {
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
		const actions = [StatActions.addScore(Math.floor((damage + awards) * bodyFactor), killer)];

		if (!isFriendlyFire && symDamage) {
			actions.push(StatActions.addScore(-Math.floor(damage * bodyFactor * SYM_DAMAGE_WEIGHT), victim));
		}

		return actions;
	};

	static faceCoin = (id: Player): void => {
		state.dispatch(StatActions.addScore(COIN_AWARD, id));
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
