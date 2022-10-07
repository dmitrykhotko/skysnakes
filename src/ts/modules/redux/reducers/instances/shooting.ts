import { Action, SetValueAction } from '../..';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { Bullet, Id } from '../../../../utils/types';
import { FIRE, REMOVE_BULLET, RESET_GAME, RESET_SHOOTING, SET_BULLET } from '../../../../utils/constants';
import { ActionInput } from '../../../../utils/enums';
import { setValue } from '../utils';

export type ShootingState = {
	bullets: Record<Id, Bullet>;
	fire?: ActionInput;
};

export type ShootingStore = {
	shooting: ShootingState;
};

const initialState = {
	shooting: {
		bullets: {}
	}
} as ShootingStore;

const setBullet = (state: Store, action: Action): ShootingStore => {
	const shootingState = state as ShootingStore;
	const { value } = action as SetValueAction<Bullet>;

	return {
		...shootingState,
		shooting: {
			...shootingState.shooting,
			bullets: {
				...shootingState.shooting.bullets,
				[value.id]: value
			}
		}
	};
};

const removeBullet = (state: Store, action: Action): ShootingStore => {
	const shootingState = state as ShootingStore;
	const { value } = action as SetValueAction<Id>;

	const bullets = Object.values(shootingState.shooting.bullets)
		.filter(bullet => bullet.id !== value)
		.reduce((acc, bullet) => {
			acc[bullet.id] = bullet;
			return acc;
		}, {} as Record<Id, Bullet>);

	return {
		...shootingState,
		shooting: {
			...shootingState.shooting,
			bullets
		}
	};
};

export abstract class ShootingReducer extends Reducer<ShootingStore> {
	static getInitialState = (): ShootingStore => initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;

		switch (type) {
			case FIRE:
				return setValue(state as ShootingStore, action, 'shooting', 'fire');
			case SET_BULLET:
				return setBullet(state, action);
			case REMOVE_BULLET:
				return removeBullet(state, action);
			case RESET_SHOOTING:
			case RESET_GAME:
				return { ...state, ...initialState };
			default:
				return state;
		}
	};
}
