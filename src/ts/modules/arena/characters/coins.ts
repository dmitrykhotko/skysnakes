import { Hlp } from '../../../utils';
import { COINS_NUMBER, COIN_LIVE_TIME, INIT_COINS_MAX_DELAY, RESPAWN_COIN_MAX_DELAY } from '../../../utils/constants';
import { Id, Point } from '../../../utils/types';
import { ArenaActions, ArenaStore, BinActions, state } from '../../redux';

export abstract class Coins {
	private static activeCoins = 0;

	static init = (): void => {
		for (let i = 0; i < COINS_NUMBER; i++) {
			this.set(INIT_COINS_MAX_DELAY);
		}
	};

	static inspect = (): void => {
		this.activeCoins < COINS_NUMBER && this.set();
	};

	static checkFound = (object: Point): boolean => {
		const { coins } = state.get<ArenaStore>().arena;
		let success = false;

		for (let i = 0; i < coins.length; i++) {
			const { id, point } = coins[i];

			success = Hlp.comparePoints(object, point);

			if (success) {
				this.remove(id);
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

		this.activeCoins++;

		Hlp.delayTask(() => {
			const freeCells = Hlp.getFreeCells(width, height);
			const coinCellIndex = Hlp.randomInt(freeCells.length);
			const coinCellValue = freeCells[coinCellIndex];
			const x = coinCellValue % width;
			const y = (coinCellValue - x) / width;
			const id = Hlp.generateId();
			const point = { x, y };

			state.dispatch(ArenaActions.setCoin({ id, point }));

			Hlp.delayTask(() => {
				const coin = Hlp.getById(id, state.get<ArenaStore>().arena.coins);

				if (!coin) {
					return;
				}

				this.remove(id);
				state.dispatch(BinActions.moveToBin([point]));
			}, Hlp.randomInt(COIN_LIVE_TIME));
		}, Hlp.randomInt(delay));
	};

	private static remove = (id: Id): void => {
		state.dispatch(ArenaActions.removeCoin(id));
		this.activeCoins--;
	};
}
