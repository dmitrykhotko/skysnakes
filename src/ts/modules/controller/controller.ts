import { COIN_WEIGHT, SET_INPUT, SET_RESET, SET_START } from '../../utils/constants';
import { ControlInput, FireInput, MoveInput, Player } from '../../utils/enums';
import {
	ArenaStore,
	BulletsStore,
	InputStore,
	SettingsStore,
	SnakesActions,
	SnakesStore,
	state,
	BulletsActions,
	Store,
	BinStore
} from '../redux';
import { Arena } from '../arena/arena';
import { Observer } from '../observable/observer';
import { Renderer } from '../renderers/renderer';
import {
	ActionInputToPlayer,
	arenaStrategies,
	ControllerProps,
	defaultProps,
	inputToIdDirection,
	playerModeToDirections
} from './utils';
import { generateId, nextPointCreator } from '../../utils/helpers';
import { GameState, Score, WeightedScore } from '../../utils/types';
import { NormalStrategy } from '../arena/strategies';

export class Controller {
	private arena!: Arena;
	private renderer: Renderer;
	private width: number;
	private height: number;
	private onStart: () => void;
	private onFinish: () => void;

	constructor(props: ControllerProps) {
		const cProps = { ...defaultProps, ...props };
		const { autostart } = cProps;

		({
			renderer: this.renderer,
			width: this.width,
			height: this.height,
			onStart: this.onStart,
			onFinish: this.onFinish
		} = cProps);

		this.arena = new Arena({ width: this.width, height: this.height });
		this.subscribe();

		autostart && this.start(true);
	}

	notify(): void {
		this.arena.move();

		const arenaState = this.getArenaData();

		this.renderer.render(arenaState);

		if (!arenaState.inProgress) {
			return this.onFinish();
		}
	}

	private getArenaData = (): GameState => {
		const { arena, snakes, bullets, bin } = state.get<ArenaStore & SnakesStore & BulletsStore & BinStore>();
		return {
			...arena,
			snakes,
			bullets,
			bin,
			score: this.getScore(arena.score)
		} as GameState;
	};

	private start = (reset = false): void => {
		const { playerMode, arenaType, drawGrid, deathsNum } = state.get<SettingsStore>().settings;
		const directions = playerModeToDirections[playerMode];

		this.renderer.reset(drawGrid);
		this.arena.start(directions, deathsNum, reset, new arenaStrategies[arenaType](), new NormalStrategy());

		this.onStart();
	};

	private reset = (): void => {
		this.start(true);
	};

	private subscribe = (): void => {
		state.subscribe(this.handleInput as Observer, SET_INPUT);
		state.subscribe(this.handleControlInput as Observer, SET_START);
		state.subscribe(this.handleControlInput as Observer, SET_RESET);
	};

	private handleInput = (store: InputStore): void => {
		const { playerInput } = store.input;

		MoveInput[playerInput] && this.handleDirectionChange(store);
		FireInput[playerInput] && this.handleFire(store);
	};

	private handleControlInput = (store: InputStore): void => {
		switch (store.input.controlInput) {
			case ControlInput.Start:
				this.start(false);
				break;
			case ControlInput.Reset:
				this.reset();
				break;
			default:
				break;
		}
	};

	private handleDirectionChange = (store: InputStore): void => {
		const { playerInput } = store.input;
		const { id, direction } = inputToIdDirection[playerInput as MoveInput];

		state.dispatch(SnakesActions.sendDirection(direction, id));
	};

	private handleFire = (store: Store): void => {
		const { playerInput } = (store as InputStore).input;
		const player = ActionInputToPlayer[playerInput as FireInput];
		const snake = (store as SnakesStore).snakes[player];

		if (!snake) {
			return;
		}

		const { head, direction } = snake;

		state.dispatch(
			BulletsActions.setBullet({ id: generateId(), player, point: nextPointCreator[direction](head), direction })
		);
	};

	private getScore = (score: Record<Player, Score>): WeightedScore[] => {
		const wScore = [] as WeightedScore[];
		const scoreArr = Object.entries(score);

		for (let i = 0; i < scoreArr.length; i++) {
			const [id, { deaths, coins }] = scoreArr[i];
			wScore.push({ id: +id, deaths, score: coins * COIN_WEIGHT });
		}

		return wScore;
	};
}
