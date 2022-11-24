import { CmHlp } from '../../common/cmHlp';
import {
	Coin,
	GameState,
	NotificationLight,
	Point,
	PointWithId,
	SnakeArrayData,
	StatState,
	StatStateLight
} from '../../common/types';
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

	private convertSnakes = (snakes: SnakeData[]): SnakeArrayData[] | undefined => {
		const arr = [] as SnakeArrayData[];

		for (let i = 0; i < snakes.length; i++) {
			const { id, serviceId, head } = snakes[i];
			const [x, y] = head;
			const prevSnake = CmHlp.getById(id, this.prevSnakes);
			const prevHead = prevSnake?.head;
			const shouldSend = !(prevHead && Hlp.comparePoints(head, prevHead));

			shouldSend &&
				arr.push({
					id,
					h: [x, y],
					p: prevSnake && prevSnake.serviceId === serviceId && head.prev ? 1 : undefined
				});
		}

		snakes.length && (this.prevSnakes = snakes);

		return arr.length ? arr : undefined;
	};

	private convertStat = (stat: StatState): StatStateLight | undefined => {
		const { n: notifications } = stat;

		if (!(notifications && notifications.length)) {
			return stat as StatStateLight;
		}

		const { ps, w } = stat;
		const nLight = [] as NotificationLight[];
		const { width } = Hlp.getSize(this.state);

		for (let i = 0; i < notifications.length; i++) {
			const { p, t, v } = notifications[i];

			nLight.push({
				p: CmHlp.pointToNum(width, p),
				t,
				v
			});
		}

		return {
			ps,
			w,
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

	private getPointWithIdItem = ({ p }: PointWithId): Point => p;
}
