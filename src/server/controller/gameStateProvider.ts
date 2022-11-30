import { CmHlp } from '../../common/cmHlp';
import {
	AudioNotif,
	Coin,
	CoinSlim,
	GameState,
	NotifSlim,
	NotifsState,
	Observer,
	Point,
	PointWithId,
	SnakeDataSlim,
	StatState,
	StatStateSlim,
	VisualNotif
} from '../../common/types';
import { ArenaStore, BinStore, BulletsStore, NotifsStore, SnakesStore, StatStore } from '../redux';
import { Action, ArenaActions, BinActions, NotifsActions } from '../redux/actions';
import { State } from '../redux/state';
import { Hlp } from '../utils/hlp';
import { SnakeData } from '../utils/types';

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
			stat,
			notifs
		} = this.state.get<ArenaStore & BinStore & BulletsStore & NotifsStore & SnakesStore & StatStore>();

		const result = {
			s: status,
			ss: this.convertSnakes(snakes),
			bs: this.convertPoints(bullets, this.getPointWithIdItem),
			b: this.convertPoints(bin, this.getPointItem)
			// ai: { coinsNum: arena.coins.length },
		} as GameState;

		const targetNotifs = this.convertNotifs(notifs, 'audio', this.convertAudioNotif);
		actions.push(BinActions.emptyBin(), NotifsActions.clearAudioNotifs());

		// balancing data object
		if (!result.ss) {
			result.c = this.convertCoins(coinsBuffer);
			result.st = this.convertStat(stat);

			targetNotifs.push(...this.convertNotifs(notifs, 'visual', this.convertVisualNotif));
			actions.push(NotifsActions.clearVisualNotifs(), ArenaActions.flushCoinsBuffer());
		}

		targetNotifs.length && (result.n = targetNotifs);
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
		const { playersStat, winners } = stat;
		const pStatSlim = [];

		for (let i = 0; i < playersStat.length; i++) {
			const { id, lives, score } = playersStat[i];

			pStatSlim.push([id, lives, score]);
		}

		return {
			ps: pStatSlim,
			w: winners
		};
	};

	private convertNotifs = <T extends AudioNotif | VisualNotif>(
		state: NotifsState,
		type: keyof NotifsState,
		toSlim: Observer<T, NotifSlim>
	): NotifSlim[] => {
		const notifs = state[type] as T[];

		if (!notifs) {
			return [];
		}

		const notifsSlim = [] as NotifSlim[];

		for (let i = 0; i < notifs.length; i++) {
			notifsSlim.push(toSlim(notifs[i]));
		}

		return notifsSlim;
	};

	private convertAudioNotif = ({ type }: AudioNotif): NotifSlim => [type];

	private convertVisualNotif = ({ point, type, value }: VisualNotif): NotifSlim => [
		type,
		value,
		CmHlp.pointToNum(Hlp.getSize(this.state).width, point)
	];

	private convertPoints = <T>(points: T[], getItem: Observer<T, Point>): number[] | undefined => {
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
