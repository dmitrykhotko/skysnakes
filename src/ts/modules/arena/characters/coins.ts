import { Hlp } from '../../../utils';
import { COINS_NUMBER, INIT_COINS_MAX_DELAY, RESPAWN_COIN_MAX_DELAY } from '../../../utils/constants';
import { Point } from '../../../utils/types';
import { ArenaActions, ArenaStore, state } from '../../redux';

export abstract class Coins {
	// move width and height to the redux
	static init = (): void => {
		for (let i = 0; i < COINS_NUMBER; i++) {
			this.set(INIT_COINS_MAX_DELAY);
		}
	};

	static checkFound = (object: Point): boolean => {
		const { coins } = state.get<ArenaStore>().arena;

		let success = false;

		for (let i = 0; i < coins.length; i++) {
			const { id, point } = coins[i];

			success = Hlp.comparePoints(object, point);

			if (success) {
				state.dispatch(ArenaActions.removeCoin(id));
				this.set();

				break;
			}
		}

		return success;
	};

	static toNums = (): Set<number> => {
		const { width } = Hlp.getSize();
		const set: Set<number> = new Set<number>();
		const { coins } = state.get<ArenaStore>().arena;

		for (let i = 0; i < coins.length; i++) {
			const { point } = coins[i];
			set.add(point.x + point.y * width);
		}

		return set;
	};

	private static set = (delay = RESPAWN_COIN_MAX_DELAY): void => {
		const { width, height } = Hlp.getSize();
		Hlp.delayTask(() => {
			const freeCells = Hlp.getFreeCells(width, height);
			const coinCellIndex = Hlp.randomInt(freeCells.length);
			const coinCellValue = freeCells[coinCellIndex];
			const x = coinCellValue % width;
			const y = (coinCellValue - x) / width;

			state.dispatch(ArenaActions.setCoin({ id: Hlp.generateId(), point: { x, y } }));
		}, Hlp.randomInt(delay));
	};
}
