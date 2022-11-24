import { Player } from '../../common/enums';
import { getById } from '../../common/getById';
import { Bullet, GameState, Point, SnakeArrayData } from '../../common/types';
import { ArenaStore, BinStore, BulletsStore, SnakesStore, StatStore } from '../redux';
import { State } from '../redux/state';
import { Hlp } from '../utils/hlp';
import { SnakeData } from '../utils/types';

export class GameStateProvider {
	private prevSnakes = [] as SnakeData[];

	constructor(private state: State) {}

	get = (): GameState => {
		const result = {} as GameState;
		const { arena, snakes, bullets, bin, stat } = this.state.get<
			ArenaStore & SnakesStore & BulletsStore & BinStore & StatStore
		>();

		bullets.length && (result.bs = this.convertBullets(bullets));
		snakes.length && (result.ss = this.convertSnakes(snakes));
		arena.coinsBuffer.length && (result.c = arena.coinsBuffer);
		bin.length && (result.b = bin);

		return {
			s: arena.status,
			st: stat,
			// ai: { coinsNum: arena.coins.length },
			...result
		} as GameState;
	};

	private convertSnakes = (snakes: SnakeData[]): SnakeArrayData[] | undefined => {
		const arr = [] as SnakeArrayData[];

		for (let i = 0; i < snakes.length; i++) {
			const { id, serviceId, head } = snakes[i];
			const [x, y] = head;
			const prevSnake = getById(id, this.prevSnakes);
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

	private convertBullets = (bullets: Bullet[]): Point[] => Hlp.mapByProp(bullets, 'p') as Point[];
}
