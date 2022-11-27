import { CmHlp } from '../../common/cmHlp';
import {
	Coin,
	CoinSlim,
	GameState,
	Point,
	PointWithId,
	SnakeDataSlim,
	StatState,
	StatStateSlim
} from '../../common/types';
import { ArenaStore, BinStore, BulletsStore, SnakesStore, StatStore } from '../redux';
import { Action, ArenaActions, BinActions, StatActions } from '../redux/actions';
import { State } from '../redux/state';
import { Hlp } from '../utils/hlp';
import { SnakeData } from '../utils/types';

type getItemFunc = (item: unknown) => Point;

export class GameStateProvider {
	private prevSnakes = [] as SnakeData[];

	constructor(private state: State) {}

	get = (): GameState => {
		const actions = [] as Action[];
		const {
			arena: { status, coinsBuffer },
			snakes,
			bullets,
			bin,
			stat
		} = this.state.get<ArenaStore & SnakesStore & BulletsStore & BinStore & StatStore>();

		const result = {
			s: status,
			ss: this.convertSnakes(snakes),
			bs: this.convertPoints(bullets, this.getPointWithIdItem as getItemFunc),
			b: this.convertPoints(bin, this.getPointItem as getItemFunc)
			// ai: { coinsNum: arena.coins.length },
		} as GameState;

		actions.push(BinActions.emptyBin());

		// balancing data object
		if (!result.ss) {
			result.c = this.convertCoins(coinsBuffer);
			result.st = this.convertStat(stat);
			actions.push(StatActions.clearNotifications(), ArenaActions.flushCoinsBuffer());
		}

		this.state.dispatch(...actions);

		return result;
	};

	private convertCoins = (coins: Coin[]): CoinSlim[] | undefined => {
		if (!(coins && coins.length)) {
			return;
		}

		const { width } = Hlp.getSize(this.state);
		const coinsSlim = [] as CoinSlim[];

		for (let i = 0; i < coins.length; i++) {
			const { point, type } = coins[i];
			const coin = [CmHlp.pointToNum(width, point), type] as number[];

			coinsSlim.push(coin);
		}

		return coinsSlim;
	};

	private convertSnakes = (snakes: SnakeData[]): SnakeDataSlim[] | undefined => {
		const { width } = Hlp.getSize(this.state);
		const arr = [] as SnakeDataSlim[];

		for (let i = 0; i < snakes.length; i++) {
			const { id, serviceId, head } = snakes[i];
			const prevSnake = CmHlp.getById(id, this.prevSnakes);
			const prevHead = prevSnake?.head;
			const shouldSend = !(prevHead && Hlp.comparePoints(head, prevHead));

			if (!shouldSend) {
				continue;
			}

			const data = [id, CmHlp.pointToNum(width, head)];

			!(prevSnake && prevSnake.serviceId === serviceId && head.prev) && data.push(1);
			arr.push(data);
		}

		snakes.length && (this.prevSnakes = snakes);

		return arr.length ? arr : undefined;
	};

	private convertStat = (stat: StatState): StatStateSlim | undefined => {
		const { notifications } = stat;
		const { playersStat, winners } = stat;

		const pStatSlim = [];

		for (let i = 0; i < playersStat.length; i++) {
			const { id, lives, score } = playersStat[i];

			pStatSlim.push([id, lives, score]);
		}

		const res = {
			ps: pStatSlim,
			w: winners
		};

		if (!(notifications && notifications.length)) {
			return res;
		}

		const { width } = Hlp.getSize(this.state);
		const nLight = [];

		for (let i = 0; i < notifications.length; i++) {
			const { point, type, value } = notifications[i];
			nLight.push([CmHlp.pointToNum(width, point), type, value]);
		}

		return {
			...res,
			n: nLight
		};
	};

	private convertPoints = (points: Point[] | PointWithId[], getItem: getItemFunc): number[] | undefined => {
		const arr = [] as number[];
		const { width } = Hlp.getSize(this.state);

		for (let i = 0; i < points.length; i++) {
			arr.push(CmHlp.pointToNum(width, getItem(points[i])));
		}

		return arr.length ? arr : undefined;
	};

	private getPointItem = (p: Point): Point => p;

	private getPointWithIdItem = ({ point }: PointWithId): Point => point;
}
