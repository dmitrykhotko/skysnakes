import { COIN_WEIGHT, SET_INPUT, SET_RESET, SET_START } from '../../utils/constants';
import { ControlInput, FireInput, MoveInput } from '../../utils/enums';
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
	fireInputToPlayerId,
	arenaStrategies,
	ControllerProps,
	defaultProps,
	inputToIdDirection,
	toDirectionsAndPlayers
} from './utils';
import { GameState, PlayersStat } from '../../utils/types';
import { NormalStrategy } from '../arena/strategies';
import { Hlp, SnakesUtils } from '../../utils';
0;
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
		this.arena.step();

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
			winners: [...arena.winners].sort(),
			score: [...this.getPlayersStat(arena.playersStat)].sort((p1, p2) => p1.id - p2.id)
		} as GameState;
	};

	private start = (reset = false): void => {
		const { playerMode, arenaType, drawGrid, lives } = state.get<SettingsStore>().settings;
		const snakesInitial = toDirectionsAndPlayers[playerMode];

		this.renderer.reset(drawGrid);
		this.arena.start(snakesInitial, lives, reset, new arenaStrategies[arenaType](), new NormalStrategy());

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

	private handleDirectionChange = (store: Store): void => {
		const { playerInput } = (store as InputStore).input;
		const { id, direction } = inputToIdDirection[playerInput as MoveInput];
		const snake = SnakesUtils.getById(id);

		snake && state.dispatch(SnakesActions.newDirection(direction, id));
	};

	private handleFire = (store: Store): void => {
		const { playerInput } = (store as InputStore).input;
		const id = fireInputToPlayerId[playerInput as FireInput];
		const snake = SnakesUtils.getById(id);

		if (!snake) {
			return;
		}

		const { head, direction } = snake;

		state.dispatch(
			BulletsActions.setBullet({
				id: Hlp.generateId(),
				player: id,
				point: Hlp.nextPoint(head, direction),
				direction
			})
		);
	};

	private getPlayersStat = (playersStat: PlayersStat[]): PlayersStat[] => {
		const wScore = [] as PlayersStat[];

		for (let i = 0; i < playersStat.length; i++) {
			const { id, lives, score } = playersStat[i];
			wScore.push({ id, lives, score: score * COIN_WEIGHT });
		}

		return wScore;
	};
}
