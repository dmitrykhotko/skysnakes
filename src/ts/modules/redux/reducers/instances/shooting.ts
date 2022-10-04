import { Action, SetValueAction } from '../..';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { Bullet, Id } from '../../../../utils/types';
import { FIRE, SET_BULLET } from '../../../../utils/constants';
import { ActionInput } from '../../../../utils/enums';
import { setValue } from '../utils';

export type ShootingStore = {
	shooting: {
		bullets: Record<Id, Bullet>;
		fire?: ActionInput;
	};
};

const initialState = {
	shooting: {
		bullets: {}
	}
} as ShootingStore;

const setBullet = <T extends Bullet>(state: Store, action: Action): ShootingStore => {
	const shootingState = state as ShootingStore;
	const { value } = action as SetValueAction<T>;

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

export abstract class ShootingReducer extends Reducer<ShootingStore> {
	static getInitialState = (): ShootingStore => initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;

		switch (type) {
			case FIRE:
				return setValue(state as ShootingStore, action, 'shooting', 'fire');
			case SET_BULLET:
				return setBullet(state, action);
			default:
				return state;
		}
	};
}
