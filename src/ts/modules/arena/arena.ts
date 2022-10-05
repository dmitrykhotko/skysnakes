import { HEIGHT, SET_IN_PROGRESS, WIDTH } from '../../utils/constants';
import { Direction, Player } from '../../utils/enums';
import { comparePoints } from '../../utils/helpers';
import { Action, ArenaActions, ArenaStore, SnakesStore, state } from '../redux';
import { Point, Score } from '../../utils/types';
import { Observer } from '../observable/observer';
import { Serpentarium } from '../characters/snake';
import { BulletsManager } from '../characters/bullets/bulletsManager';
import { ArenaState } from '../redux/reducers/instances/arena';

export type ArenaProps = {
	width?: number;
	height?: number;
};

const defaultProps = {
	width: WIDTH,
	height: HEIGHT
};

export class Arena {
	private snakes!: Serpentarium;
	private deathsNum!: number;
	private width: number;
	private height: number;

	constructor(props: ArenaProps) {
		const aProps = { ...defaultProps, ...props };

		({ width: this.width, height: this.height } = aProps);

		this.subscribe();
	}

	start = (directions: Direction[], deathsNum: number, reset = false): void => {
		const { score, loosers } = this.getState();
		const resetScore = Object.keys(score).length !== directions.length || loosers.length || reset;

		this.deathsNum = deathsNum;
		this.snakes = new Serpentarium(directions.map(d => ({ head: this.getStartPoint(d), direction: d })));

		const actions = [this.setCoin(), ArenaActions.setInProgress(true)];
		resetScore && this.resetScore();

		state.dispatch(...actions);
	};

	move = (): void => {
		this.snakes.move();
		BulletsManager.move();

		const heads = (state.get() as SnakesStore).snakes;
		const states = Object.entries(heads);
		const actionsList = [] as Action[];

		for (let i = 0; i < states.length; i++) {
			const [snakeId, { head }] = states[i];
			const id = +snakeId;

			if (this.snakes.faceBody(head)) {
				actionsList.push(...this.finish(id));
				continue;
			}

			const { strategy } = this.getState();
			const success = strategy.run(head, this.width, this.height, id);

			if (!success) {
				actionsList.push(...this.finish(id));
				continue;
			}

			if (this.faceCoin(head)) {
				this.snakes.grow(id);
				actionsList.push(ArenaActions.incCoins(id), this.setCoin());
				continue;
			}
		}

		actionsList.length && state.dispatch(...actionsList);
	};

	private subscribe = (): void => {
		state.subscribe(this.onInProgressChanged as Observer, SET_IN_PROGRESS);
	};

	private onInProgressChanged = (store: ArenaStore): void => {
		this.judge(store);
	};

	private setCoin = (): Action => {
		const freeCells = this.getFreeCells();
		const coinCellIndex = this.getRandomInt(freeCells.length);
		const coinCellValue = freeCells[coinCellIndex];
		const x = coinCellValue % this.width;
		const y = (coinCellValue - x) / this.width;

		return ArenaActions.setCoin({ x, y });
	};

	private resetScore = (): void => {
		state.dispatch(
			ArenaActions.setScore(
				this.snakes.getPlayers().reduce((acc, player) => {
					acc[player] = { deaths: 0, coins: 0 };
					return acc;
				}, {} as Record<Player, Score>)
			),
			ArenaActions.setLoosers([])
		);
	};

	private getState = (): ArenaState => (state.get() as ArenaStore).arena;

	private finish = (id: Player): Action[] => [ArenaActions.incDeaths(id), ArenaActions.setInProgress(false)];

	private judge = (store: ArenaStore): void => {
		const { score, inProgress } = store.arena;

		if (inProgress) {
			return;
		}

		const loosers = [] as Player[];

		Object.entries(score).forEach(([id, score]) => {
			const player = +id as Player;

			if (score.deaths === this.deathsNum) {
				loosers.push(player);
			}
		});

		loosers.length && state.dispatch(ArenaActions.setLoosers(loosers));
	};

	private getFreeCells = (): number[] => {
		const cells: number[] = [];
		const bodiesSet = this.snakes.getBodiesSet(this.width);

		for (let i = 0; i < this.width * this.height; i++) {
			if (bodiesSet.has(i)) {
				continue;
			}

			cells.push(i);
		}

		return cells;
	};

	private faceCoin = (head: Point): boolean => {
		const { coin } = this.getState();
		return comparePoints(head, coin);
	};

	private getRandomInt = (max: number): number => Math.floor(Math.random() * max);

	private getStartPoint = (direction: Direction): Point => {
		let head: Point;
		switch (direction) {
			case Direction.Right:
				head = { x: 0, y: this.height / 2 };
				break;
			case Direction.Left:
				head = { x: this.width, y: this.height / 2 };
				break;
			case Direction.Down:
				head = { x: this.width / 2, y: 0 };
				break;
			case Direction.Up:
				head = { x: this.width / 2, y: this.height };
				break;
			default:
				head = { x: 0, y: this.height / 2 };
				break;
		}

		return head;
	};
}
