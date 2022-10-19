import { SET_INPUT } from '../../utils/constants';
import { FireInput, GameStatus, MoveInput, ServiceInput } from '../../utils/enums';
import {
	ArenaStore,
	BulletsStore,
	InputStore,
	SettingsStore,
	SnakesActions,
	SnakesStore,
	state,
	BinStore,
	CommonActions,
	StatStore,
	ArenaActions
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
	private onStart: () => void;
	private onFinish: () => void;

	constructor(props: ControllerProps) {
		const cProps = { ...defaultProps, ...props };
		const { autostart } = cProps;

		({ renderer: this.renderer, onStart: this.onStart, onFinish: this.onFinish } = cProps);

		const { width, height } = cProps;

		state.dispatch(ArenaActions.setSize({ width, height }));
		this.arena = new Arena();
		state.subscribe(this.handleInput as Observer, SET_INPUT);
		autostart && this.start();
	}

	notify(): void {
		this.arena.step();

		const arenaState = this.getArenaData();

		this.renderer.render(arenaState);
		state.dispatch(ArenaActions.flushCoinsBuffer());

		if (arenaState.gameStatus !== GameStatus.InProgress) {
			return this.onFinish();
		}
	}

	private getArenaData = (): GameState => {
		const { arena, snakes, bullets, bin, stat } = state.get<
			ArenaStore & SnakesStore & BulletsStore & BinStore & StatStore
		>();

		return {
			...arena,
			...stat,
			snakes,
			bullets,
			bin,
			coins: arena.coinsBuffer,
			additionalInfo: { coinsNum: arena.coins.length }
		} as GameState;
	};

	private start = (): void => {
		const { playerMode, arenaType, lives } = state.get<SettingsStore>().settings;
		const snakesInitial = toDirectionsAndPlayers[playerMode];

		state.dispatch(CommonActions.resetGame());
		state.dispatch(
			...Stat.reset(
				snakesInitial.map(({ id }) => id),
				lives
			)
		);

		this.arena.start(snakesInitial, new arenaStrategies[arenaType](), new NormalStrategy());
		this.renderer.reset();
		this.renderer.focus();

		this.onStart();
	};

	private handleInput = (store: InputStore): void => {
		const { playerInput: input } = store.input;
		const { gameStatus } = state.get<ArenaStore>().arena;

		ServiceInput[input] && this.handleServiceInput();

		if (gameStatus !== GameStatus.InProgress) {
			return;
		}

		MoveInput[input] && this.handleMoveInput(input as MoveInput);
		FireInput[input] && this.handleFireInput(input as FireInput);
	};

	private handleServiceInput = (): void => {
		const { gameStatus } = state.get<ArenaStore>().arena;

		switch (gameStatus) {
			case GameStatus.InProgress:
				state.dispatch(ArenaActions.setGameStatus(GameStatus.Pause));
				this.onFinish();

				break;
			case GameStatus.Pause:
				state.dispatch(ArenaActions.setGameStatus(GameStatus.InProgress));
				this.onStart();

				break;
			case GameStatus.Stop:
				this.start();
				break;
			default:
				break;
		}

		this.renderer.focus();
	};

	private handleMoveInput = (input: MoveInput): void => {
		const { id, direction } = inputToIdDirection[input];
		const snake = Snakes.getById(id);

		snake && state.dispatch(SnakesActions.newDirection(direction, id));
	};

	private handleFireInput = (input: FireInput): void => {
		const id = fireInputToPlayerId[input];
		const snake = Snakes.getById(id);

		if (!snake) {
			return;
		}

		const { head, direction } = snake;
		Bullets.create(id, Hlp.nextPoint(head, direction), direction);
	};
}
