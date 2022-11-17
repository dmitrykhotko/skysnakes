import { GameStatus, ServiceInput } from '../../../common/enums';
import { MessageType } from '../../../common/messageType';
import { GameState, Message, Observer, PlayerInput, Size } from '../../../common/types';
import { WSHlp } from '../../../common/wSHlp';
import { ControlPanel } from '../controlPanel/controlPanel';
import { ControlScreen } from '../controlScreen/controlScreen';
import { CanvasRenderer } from '../renderers/instances/canvasRenderer';
import { MAIN_SCREEN_DELAY } from '../utils/constants';
import { ScreenType } from '../utils/enums';
import { CanvasRendererProps, GameProps } from '../utils/types';

export class Controller {
	private wS!: WebSocket;
	private size: Size;
	private controlScreen!: ControlScreen;
	private prevState?: GameState;
	private renderer: CanvasRenderer;

	constructor({ roomUUId, showServiceInfo = false }: GameProps, rProps: CanvasRendererProps) {
		this.size = rProps.size;
		this.wS = new WebSocket(`ws://${location.hostname}:8080`);
		this.renderer = new CanvasRenderer(rProps, this.onInput as Observer, showServiceInfo);
		this.controlScreen = new ControlScreen(this.wS, this.onControlScreenHide as Observer, roomUUId);

		new ControlPanel(this.renderer.focus, this.openMenu);
		this.initConnection();
	}

	private initConnection = (): void => {
		this.wS.addEventListener('open', (): void => {
			console.log(`Connection established.`);
			this.controlScreen.show();
		});

		this.wS.addEventListener('message', (event: MessageEvent): void => {
			const { type, data } = JSON.parse(event.data) as Message<unknown>;

			switch (type) {
				case MessageType.GET_SIZE:
					WSHlp.send(this.wS, MessageType.SET_SIZE, this.size);
					break;
				case MessageType.START:
					this.handleStartMsg();
					break;
				case MessageType.TICK:
					this.handleTickMsg(data as GameState);
					break;
				case MessageType.PLAYER_DISCONNECTED:
					this.handlePlayerDisconnectMsg();
					break;
				default:
					break;
			}
		});

		this.wS.onclose = (): void => {
			console.log(`Connection closed.`);
			this.controlScreen.show(ScreenType.ConnectionLost);
		};
	};

	private onPlayerDisconnect = (): void => {
		this.wS.close();
		this.wS = new WebSocket(`ws://${location.hostname}:8080`);

		this.initConnection();
		this.controlScreen.initConnection(this.wS);
	};

	private onInput = (input: PlayerInput): void => {
		this.wS.readyState === WebSocket.OPEN && WSHlp.send(this.wS, MessageType.USER_INPUT, input);
	};

	private onControlScreenHide = (input?: PlayerInput): void => {
		input && this.onInput(input);
		this.renderer.focus();
	};

	private handleStartMsg = (): void => {
		this.controlScreen.hide();

		this.renderer.reset();
		this.renderer.focus();
	};

	private handleTickMsg = (state: GameState): void => {
		this.checkStatusChanged(state.status);
		this.renderer.render(state);

		this.prevState = state;
	};

	private handlePlayerDisconnectMsg = (): void => {
		this.controlScreen.show(ScreenType.PlayerDisconnected);
		setTimeout(this.onPlayerDisconnect, MAIN_SCREEN_DELAY);
	};

	private checkStatusChanged = (status: GameStatus): void => {
		const prevStatus = this.prevState?.status ?? GameStatus.Pause;

		switch (status) {
			case GameStatus.Pause:
				prevStatus === GameStatus.InProgress && this.pause();
				break;
			case GameStatus.InProgress:
				if (prevStatus === GameStatus.Pause) {
					this.controlScreen.hide();
				}

				if (prevStatus === GameStatus.Finish) {
					this.renderer.reset();
				}

				break;
			default:
				break;
		}
	};

	private pause = (): void => {
		this.controlScreen.show(ScreenType.GamePaused);
	};

	private openMenu = (): void => {
		this.onInput(ServiceInput.Escape);
	};
}
