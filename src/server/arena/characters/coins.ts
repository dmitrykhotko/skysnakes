import { CoinType, Player } from '../../../common/enums';
import { Coin, Id, LinkedPoint, Size } from '../../../common/types';
import { ArenaStore, state } from '../../redux';
import { ArenaActions, BinActions } from '../../redux/actions';
import {
	COINS_NUMBER,
	COINS_SPREAD,
	DEATH_COIN_LIFETIME,
	INIT_COINS_MAX_DELAY,
	RESPAWN_COIN_MAX_DELAY,
	STANDARD_COIN_LIFETIME
} from '../../utils/constants';
import { DelayedTasks, Task } from '../../utils/delayedTasks';
import { Hlp } from '../../utils/hlp';

export abstract class Coins {
	private static typeToLifeTime = {
		[CoinType.Standard]: STANDARD_COIN_LIFETIME,
		[CoinType.DeathPlayer1]: DEATH_COIN_LIFETIME,
		[CoinType.DeathPlayer2]: DEATH_COIN_LIFETIME
	};

	private static playerToCoinType = {
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

	static checkCollisions = (object: LinkedPoint): Coin[] => {
		const { coins } = state.get<ArenaStore>().arena;
		const facedCoins = [] as Coin[];

		for (let i = 0; i < coins.length; i++) {
			const coin = coins[i];
			const { id, point, type } = coin;
			const success = Hlp.comparePoints(object, point);

			if (success) {
				this.remove(id, type);
				this.checkNumber();

				facedCoins.push(coin);
			}
		}

		return facedCoins;
	};

	static setDeathCoins = (points: LinkedPoint[], player: Player): void => {
		const size = Hlp.getSize();
		const deathPoints = this.spreadPoints(points, size);

		for (let i = 0; i < deathPoints.length; i++) {
			this.set(Hlp.generateId(), size, deathPoints[i], this.playerToCoinType[player], player);
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
		type = CoinType.Standard,
		player?: Player
	): void => {
		state.dispatch(ArenaActions.setCoin({ id, point, type, player }));
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

	private static spreadPoints = (points: LinkedPoint[], { width, height }: Size): LinkedPoint[] => {
		const result = [] as LinkedPoint[];

		for (let i = 0; i < points.length; i++) {
			const { x, y } = points[i];

			let resultX = x + Hlp.randomInt(COINS_SPREAD, -COINS_SPREAD);
			let resultY = y + Hlp.randomInt(COINS_SPREAD, -COINS_SPREAD);

			resultX < 0 && (resultX = width + resultX);
			resultY < 0 && (resultY = height + resultY);
			resultX > width && (resultX = resultX - width);
			resultY > height && (resultY = resultY - height);

			const point = {
				x: resultX,
				y: resultY
			};

			result.push(point);
		}

		return result;
	};
}
