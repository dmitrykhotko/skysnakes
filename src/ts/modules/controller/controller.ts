import { SET_INPUT, SET_RESET, SET_START } from '../../utils/constants';
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
	BinStore,
	CommonActions,
	StatStore
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
import { GameState } from '../../utils/types';
import { NormalStrategy } from '../arena/strategies';
import { Hlp } from '../../utils';
import { Snakes } from '../arena/characters/snakes';
import { Bullets } from '../arena/characters/bullets';
import { Stat } from '../stat/stat';

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
		const { arena, snakes, bullets, bin, stat } = state.get<
			ArenaStore & SnakesStore & BulletsStore & BinStore & StatStore
		>();

		return {
			snakes,
			bullets,
			bin,
			...arena,
			...stat
		} as GameState;
	};

	private start = (reset = false): void => {
		const { playerMode, arenaType, drawGrid, lives } = state.get<SettingsStore>().settings;
		const { playersStat, winners } = state.get<StatStore>().stat;
		const snakesInitial = toDirectionsAndPlayers[playerMode];
		const resetArena = playersStat.length !== snakesInitial.length || winners.length || reset;

		state.dispatch(resetArena ? CommonActions.resetGame() : BulletsActions.reset());
		resetArena &&
			state.dispatch(
				...Stat.reset(
					snakesInitial.map(({ id }) => id),
					lives
				)
			);

		this.renderer.reset(drawGrid);
		this.arena.start(snakesInitial, new arenaStrategies[arenaType](), new NormalStrategy());

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
		const snake = Snakes.getById(id);

		snake && state.dispatch(SnakesActions.newDirection(direction, id));
	};

	private handleFire = (store: Store): void => {
		const { playerInput } = (store as InputStore).input;
		const id = fireInputToPlayerId[playerInput as FireInput];
		const snake = Snakes.getById(id);

		if (!snake) {
			return;
		}

		const { head, direction } = snake;
		Bullets.create(id, Hlp.nextPoint(head, direction), direction);
	};
}
