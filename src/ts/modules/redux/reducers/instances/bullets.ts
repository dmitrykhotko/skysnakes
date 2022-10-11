import { Action, SetValueAction } from '../..';
import { Store } from '../../state';
import { Reducer } from '../reducer';
import { Bullet, Id } from '../../../../utils/types';
import { REMOVE_BULLET, RESET_GAME, RESET_BULLETS, SET_BULLET } from '../../../../utils/constants';

export type BulletsState = Bullet[];

export type BulletsStore = {
	bullets: BulletsState;
};

export abstract class BulletsReducer extends Reducer<BulletsStore> {
	private static initialState = {
		bullets: []
	} as BulletsStore;

	static getInitialState = (): BulletsStore => this.initialState;

	static reduce = (state: Store, action: Action): Store => {
		const { type } = action;

		switch (type) {
			case SET_BULLET:
				return this.setBullet(state, action);
			case REMOVE_BULLET:
				return this.removeBullet(state, action);
			case RESET_BULLETS:
			case RESET_GAME:
				return { ...state, ...this.initialState };
			default:
				return state;
		}
	};

	private static setBullet = (state: Store, action: Action): BulletsStore => {
		const bulletsState = state as BulletsStore;
		const { value } = action as SetValueAction<Bullet>;

		return {
			...bulletsState,
			bullets: [...bulletsState.bullets.filter(({ id }) => id !== value.id), value]
		};
	};

	private static removeBullet = (state: Store, action: Action): BulletsStore => {
		const bulletsState = state as BulletsStore;
		const { value } = action as SetValueAction<Id>;

		const bullets = bulletsState.bullets.filter(bullet => bullet.id !== value);

		return {
			...bulletsState,
			bullets
		};
	};
}
