import { Action, SetValueAction } from '../..';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { Bullet, Id } from '../../../../utils/types';
import { REMOVE_BULLET, RESET_GAME, RESET_BULLETS, SET_BULLET } from '../../../../utils/constants';

export type BulletsState = Bullet[];

export type BulletsStore = {
	bullets: BulletsState;
};

const initialState = {
	bullets: []
} as BulletsStore;

const setBullet = (state: Store, action: Action): BulletsStore => {
	const bulletsState = state as BulletsStore;
	const { value } = action as SetValueAction<Bullet>;

	return {
		...bulletsState,
		bullets: [...bulletsState.bullets.filter(({ id }) => id !== value.id), value]
	};
};

const removeBullet = (state: Store, action: Action): BulletsStore => {
	const bulletsState = state as BulletsStore;
	const { value } = action as SetValueAction<Id>;

	const bullets = bulletsState.bullets.filter(bullet => bullet.id !== value);

	return {
		...bulletsState,
		bullets
	};
};

export abstract class BulletsReducer extends Reducer<BulletsStore> {
	static getInitialState = (): BulletsStore => initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;

		switch (type) {
			case SET_BULLET:
				return setBullet(state, action);
			case REMOVE_BULLET:
				return removeBullet(state, action);
			case RESET_BULLETS:
			case RESET_GAME:
				return { ...state, ...initialState };
			default:
				return state;
		}
	};
}
