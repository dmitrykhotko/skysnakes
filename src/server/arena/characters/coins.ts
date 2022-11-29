import { CmHlp } from '../../../common/cmHlp';
import { CoinType, Player } from '../../../common/enums';
import { Coin, Id, LinkedPoint, Size } from '../../../common/types';
import { ArenaStore } from '../../redux';
import { ArenaActions, BinActions } from '../../redux/actions';
import { State } from '../../redux/state';
import {
	COINS_SPREAD,
	DEATH_COIN_LIFETIME,
	INIT_COINS_MAX_DELAY,
	RESPAWN_COIN_MAX_DELAY,
	STANDARD_COIN_LIFETIME
} from '../../utils/constants';
import { DelayedTasks, Task } from '../../utils/delayedTasks';
import { Hlp } from '../../utils/hlp';

export class Coins {
	private static typeToLifeTime = {
		[CoinType.Standard]: STANDARD_COIN_LIFETIME,
		[CoinType.DeathPlayer1]: DEATH_COIN_LIFETIME,
		[CoinType.DeathPlayer2]: DEATH_COIN_LIFETIME
	};

	private static playerToCoinType = {
		[Player.P1]: CoinType.DeathPlayer1,
		[Player.P2]: CoinType.DeathPlayer2
	};

	private coinsNumberMax!: number;
	private activeCoinsNum = 0;

	constructor(private state: State) {}

	init = (coinsNumberMax: number): void => {
		this.coinsNumberMax = coinsNumberMax;
		this.activeCoinsNum = 0;

		for (let i = 0; i < this.coinsNumberMax; i++) {
			this.delayedSet(INIT_COINS_MAX_DELAY);
		}
	};

	checkNumber = (): void => {
		this.activeCoinsNum < this.coinsNumberMax && this.delayedSet();
	};

	checkCollisions = (object: LinkedPoint): Coin[] => {
		const { coins } = this.state.get<ArenaStore>().arena;
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

	setDeathCoins = (points: LinkedPoint[], player: Player): void => {
		const size = Hlp.getSize(this.state);
		const deathPoints = this.spreadPoints(points, size);

		for (let i = 0; i < deathPoints.length; i++) {
			this.set(Hlp.id(), size, deathPoints[i], Coins.playerToCoinType[player], player);
		}
	};

	private delayedSet = (delay = RESPAWN_COIN_MAX_DELAY): void => {
		const id = Hlp.id();

		this.activeCoinsNum++;
		DelayedTasks.delay(this.set as Task, Hlp.randomInt(delay), id, Hlp.getSize(this.state));
	};

	private set = (
		id: Id,
		{ width, height }: Size,
		point = [Hlp.randomInt(width), Hlp.randomInt(height)],
		type = CoinType.Standard,
		player?: Player
	): void => {
		this.state.dispatch(ArenaActions.setCoin({ id, point, type, player }));
		DelayedTasks.delay(this.remove as Task, Hlp.randomInt(Coins.typeToLifeTime[type]), id, type);
	};

	private remove = (id: Id, type: CoinType): void => {
		const coin = CmHlp.getById(id, this.state.get<ArenaStore>().arena.coins);

		if (!coin) {
			return;
		}

		type === CoinType.Standard && this.activeCoinsNum--;
		this.state.dispatch(ArenaActions.removeCoin(id), BinActions.moveToBin([coin.point]));
	};

	private spreadPoints = (points: LinkedPoint[], { width, height }: Size): LinkedPoint[] => {
		const result = [] as LinkedPoint[];

		for (let i = 0; i < points.length; i++) {
			const [x, y] = points[i];

			let resultX = x + Hlp.randomInt(COINS_SPREAD, -COINS_SPREAD);
			let resultY = y + Hlp.randomInt(COINS_SPREAD, -COINS_SPREAD);

			resultX < 0 && (resultX = width + resultX);
			resultY < 0 && (resultY = height + resultY);
			resultX > width && (resultX = resultX - width);
			resultY > height && (resultY = resultY - height);

			result.push([resultX, resultY]);
		}

		return result;
	};
}
