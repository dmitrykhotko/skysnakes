import { Hlp } from '../../../utils';
import { COINS_NUMBER, COIN_LIVE_TIME, INIT_COINS_MAX_DELAY, RESPAWN_COIN_MAX_DELAY } from '../../../utils/constants';
import { DelayedTasks, Task } from '../../../utils/delayedTasks';
import { Id, Point, Size } from '../../../utils/types';
import { ArenaActions, ArenaStore, BinActions, state } from '../../redux';

export abstract class Coins {
	private static activeCoinsIds = [] as number[];
	private static activeTasks = new Set<Id>();

	static init = (): void => {
		const activeTasks = [...this.activeTasks];

		for (let i = 0; i < activeTasks.length; i++) {
			DelayedTasks.remove(activeTasks[i]);
		}

		this.activeTasks = new Set<Id>();
		this.activeCoinsIds = [];

		for (let i = 0; i < COINS_NUMBER; i++) {
			this.set(INIT_COINS_MAX_DELAY);
		}
	};

	static inspect = (): void => {
		this.activeCoinsIds.length < COINS_NUMBER && this.set();
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

	private static removeTask = (taskId: Id, id: Id, point: Point): void => {
		const coin = Hlp.getById(id, state.get<ArenaStore>().arena.coins);

		this.activeTasks.delete(taskId);

		if (!coin) {
			return;
		}

		this.remove(id);
		state.dispatch(BinActions.moveToBin([point]));
	};

	private static setTask = (taskId: Id, id: Id, { width, height }: Size): void => {
		const point = { x: Hlp.randomInt(width), y: Hlp.randomInt(height) };

		state.dispatch(ArenaActions.setCoin({ id, point }));
		this.activeTasks.delete(taskId);

		this.activeTasks.add(DelayedTasks.delay(this.removeTask as Task, Hlp.randomInt(COIN_LIVE_TIME), id, point));
	};

	private static set = (delay = RESPAWN_COIN_MAX_DELAY): void => {
		const id = Hlp.generateId();

		this.activeCoinsIds.push(id);
		this.activeTasks.add(DelayedTasks.delay(this.setTask as Task, Hlp.randomInt(delay), id, Hlp.getSize()));
	};

	private static remove = (id: Id): void => {
		const index = this.activeCoinsIds.indexOf(id);

		~index && this.activeCoinsIds.splice(index, 1);
		state.dispatch(ArenaActions.removeCoin(id));
	};
}
