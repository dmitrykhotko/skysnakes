import { CmHlp } from '../../../common/cmHlp';
import { FireInput, GameStatus, ServiceInput } from '../../../common/enums';
import { MessageType } from '../../../common/messageType';
import { GameState, Message, Observer, PlayerInput, Size } from '../../../common/types';
import { WSHlp } from '../../../common/wSHlp';
import { BULLET_THROTTLE_DELAY } from '../../../server/utils/constants';
import { ControlPanel } from '../controlPanel/controlPanel';
import { ControlScreen } from '../controlScreen/controlScreen';
import { CanvasRenderer } from '../renderers/instances/canvasRenderer';
import { MAIN_SCREEN_DELAY, WS_PORT } from '../utils/constants';
import { ScreenType } from '../utils/enums';
import { CanvasRendererProps, GameProps } from '../utils/types';

export class Controller {
	private wS!: WebSocket;
	private controlScreen!: ControlScreen;
	private prevState?: GameState;
	private renderer: CanvasRenderer;

	private throttledFireInput: Observer;

	constructor({ roomUUId, showServiceInfo = false }: GameProps, private size: Size, rProps: CanvasRendererProps) {
		this.wS = this.createWS();
		this.renderer = new CanvasRenderer(rProps, this.onInput as Observer, showServiceInfo);
		this.controlScreen = new ControlScreen(
			this.wS,
			this.onControlScreenHide as Observer,
			this.reconnect as Observer,
			roomUUId
		);

		new ControlPanel(this.renderer.focus, this.openMenu);
		this.initConnection();

		this.throttledFireInput = CmHlp.throttle(
			WSHlp.send.bind(null, this.wS, MessageType.USER_INPUT, FireInput.RFire),
			BULLET_THROTTLE_DELAY
		);
	}

	private createWS = (): WebSocket => new WebSocket(`ws://${location.hostname}:${WS_PORT}`);

	private initConnection = (): void => {
		this.wS.addEventListener('open', (): void => {
			console.log(`Connection established.`);
			this.controlScreen.show();
		});

		this.wS.addEventListener('message', (event: MessageEvent): void => {
			const { t: type, d: data } = JSON.parse(event.data) as Message<unknown>;

			switch (type) {
				case MessageType.GET_SIZE:
					WSHlp.send(this.wS, MessageType.SEND_SIZE, this.size);
					break;
				case MessageType.SET_SIZE:
					this.renderer.init(data as Size);
					WSHlp.send(this.wS, MessageType.PLAYER_IS_READY);
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
		this.reconnect();
	};

	private onInput = (input: PlayerInput): void => {
		FireInput[input] ? this.throttledFireInput() : WSHlp.send(this.wS, MessageType.USER_INPUT, input);
	};

	private onControlScreenHide = (input?: PlayerInput): void => {
		input && this.onInput(input);
		this.renderer.focus();
	};

	private reconnect = (): void => {
		this.wS.close();
		this.wS = this.createWS();

		this.initConnection();
		this.controlScreen.initConnection(this.wS);
	};

	private handleStartMsg = (): void => {
		this.controlScreen.hide();

		this.renderer.reset();
		this.renderer.focus();
	};

	private handleTickMsg = (state: GameState): void => {
		this.checkStatusChanged(state.s ?? GameStatus.Finish);
		this.renderer.render(state);

		this.prevState = state;
	};

	private handlePlayerDisconnectMsg = (): void => {
		this.controlScreen.show(ScreenType.PlayerDisconnected);
		setTimeout(this.onPlayerDisconnect, MAIN_SCREEN_DELAY);
	};

	private checkStatusChanged = (status: GameStatus): void => {
		const prevStatus = this.prevState?.s ?? GameStatus.Pause;

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
