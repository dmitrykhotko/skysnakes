import { Hlp } from '../../../utils';
import {
	COINS_NUMBER,
	STANDARD_COIN_LIFETIME,
	INIT_COINS_MAX_DELAY,
	RESPAWN_COIN_MAX_DELAY,
	DEATH_COIN_LIFETIME
} from '../../../utils/constants';
import { DelayedTasks, Task } from '../../../utils/delayedTasks';
import { CoinType, Player } from '../../../utils/enums';
import { Id, Point, Size } from '../../../utils/types';
import { ArenaActions, ArenaStore, BinActions, state } from '../../redux';

export abstract class Coins {
	private static typeToLifeTime = {
		[CoinType.Standard]: STANDARD_COIN_LIFETIME,
		[CoinType.DeathPlayer1]: DEATH_COIN_LIFETIME,
		[CoinType.DeathPlayer2]: DEATH_COIN_LIFETIME
	};

	private static playerToDeathPlayer = {
		[Player.P1]: CoinType.DeathPlayer1,
		[Player.P2]: CoinType.DeathPlayer2
	};

	private static activeCoinsNum = 0;

	static init = (): void => {
		this.activeCoinsNum = 0;

		for (let i = 0; i < COINS_NUMBER; i++) {
			this.delayedSet(INIT_COINS_MAX_DELAY);
		}
	};

	static checkNumber = (): void => {
		this.activeCoinsNum < COINS_NUMBER && this.delayedSet();
	};

	static checkCollisions = (object: Point): number => {
		const { coins } = state.get<ArenaStore>().arena;

		let success = false;
		let num = 0;

		for (let i = 0; i < coins.length; i++) {
			const { id, point, type } = coins[i];

			success = Hlp.comparePoints(object, point);

			if (success) {
				this.remove(id, type);
				this.checkNumber();

				num++;
			}
		}

		return num;
	};

	static setDeathCoins = (points: Point[], player: Player): void => {
		const size = Hlp.getSize();

		for (let i = 0; i < points.length; i++) {
			this.set(Hlp.generateId(), size, points[i], this.playerToDeathPlayer[player]);
		}
	};

	private static delayedSet = (delay = RESPAWN_COIN_MAX_DELAY): void => {
		const id = Hlp.generateId();

		this.activeCoinsNum++;
		DelayedTasks.delay(this.set as Task, Hlp.randomInt(delay), id, Hlp.getSize());
	};

	private static set = (
		id: Id,
		{ width, height }: Size,
		point = { x: Hlp.randomInt(width), y: Hlp.randomInt(height) },
		type = CoinType.Standard
	): void => {
		state.dispatch(ArenaActions.setCoin({ id, point, type }));
		DelayedTasks.delay(this.remove as Task, Hlp.randomInt(this.typeToLifeTime[type]), id, type);
	};

	private static remove = (id: Id, type: CoinType): void => {
		const coin = Hlp.getById(id, state.get<ArenaStore>().arena.coins);

		if (!coin) {
			return;
		}

		type === CoinType.Standard && this.activeCoinsNum--;
		state.dispatch(ArenaActions.removeCoin(id), BinActions.moveToBin([coin.point]));
	};
}
