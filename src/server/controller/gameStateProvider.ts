import { CmHlp } from '../../common/cmHlp';
import { Coin, GameState, Point, PointWithId, SnakeDataSlim, StatState, StatStateSlim } from '../../common/types';
import { ArenaStore, BinStore, BulletsStore, SnakesStore, StatStore } from '../redux';
import { State } from '../redux/state';
import { Hlp } from '../utils/hlp';
import { SnakeData } from '../utils/types';

type getItemFunc = (item: unknown) => Point;

export class GameStateProvider {
	private prevSnakes = [] as SnakeData[];

	constructor(private state: State) {}

	get = (): GameState => {
		const { arena, snakes, bullets, bin, stat } = this.state.get<
			ArenaStore & SnakesStore & BulletsStore & BinStore & StatStore
		>();

		return {
			s: arena.status,
			c: this.convertCoins(arena.coinsBuffer),
			ss: this.convertSnakes(snakes),
			bs: this.convertPoints(bullets, this.getPointWithIdItem as getItemFunc),
			st: this.convertStat(stat),
			b: this.convertPoints(bin, this.getPointItem as getItemFunc)
			// ai: { coinsNum: arena.coins.length },
		} as GameState;
	};

	private convertCoins = (coins: Coin[]): Coin[] | undefined => (coins.length ? coins : undefined);

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
