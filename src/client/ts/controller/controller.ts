import { GameStatus } from '../../../common/enums';
import { MessageType } from '../../../common/messageType';
import { GameState, Message, Observer, PlayerInput, Size } from '../../../common/types';
import { ControlsManager } from '../controlsManager/controlsManager';
import { Modal } from '../modal/modal';
import { CanvasRenderer, CanvasRendererProps } from '../renderers/instances/canvasRenderer';
import { ModalType } from '../utils/enums';
import { CONNECTION_LOST, GAME_PAUSED_MSG, PLAYER_DISCONNECTED } from '../utils/labels';

export class Controller {
	private prevState?: GameState;
	private renderer: CanvasRenderer;
	private modal: Modal;
	private ws!: WebSocket;

	constructor(rProps: CanvasRendererProps, size: Size, serviceInfoFlag = false) {
		const onInputObserver = this.onInput as Observer;

		this.renderer = new CanvasRenderer(rProps, onInputObserver, serviceInfoFlag);
		this.modal = new Modal(((input: PlayerInput): void => {
			this.onInput(input);
			this.renderer.focus();
		}) as Observer);

		new ControlsManager(this.renderer.focus);

		this.initConnection(size);
		this.modal.show({ type: ModalType.WelcomeScreen, isStatic: true });
	}

	private sendMsg = (msg: Message): void => this.ws.send(JSON.stringify(msg));

	private initConnection = (size: Size): void => {
		const { hostname } = location;
		const wsUrl = `ws://${hostname}:8080`;

		this.ws = new WebSocket(wsUrl);

		this.ws.onopen = (): void => {
			console.log(`Connection to ${wsUrl} established.`);
		};

		this.ws.onmessage = (event: MessageEvent): void => {
			const { type, data } = JSON.parse(event.data) as Message<unknown>;

			switch (type) {
				case MessageType.GET_SIZE:
					this.sendMsg({
						type: MessageType.SET_SIZE,
						data: size
					});

					break;
				case MessageType.START:
					this.handleStartMsg();

					break;
				case MessageType.TICK:
					this.handleTickMsg(data as GameState);

					break;
				case MessageType.PLAYER_DISCONNECTED:
					this.handleGameOverMsg(PLAYER_DISCONNECTED);
					break;
				default:
					break;
			}
		};

		this.ws.onclose = (): void => {
			console.log(`Connection to ${wsUrl} closed.`);
			this.handleGameOverMsg(CONNECTION_LOST);
		};
	};

	private handleStartMsg = (): void => {
		this.renderer.reset();
		this.renderer.focus();
	};

	private handleTickMsg = (state: GameState): void => {
		this.checkStatusChanged(state.status);
		this.renderer.render(state);

		this.prevState = state;
	};

	private handleGameOverMsg = (message = '', isStatic = true): void => {
		this.modal.hide();
		this.modal.show({ type: ModalType.GameOver, bottomContent: message, isStatic });
	};

	private checkStatusChanged = (status: GameStatus): void => {
		const prevStatus = this.prevState?.status ?? GameStatus.Pause;

		switch (status) {
			case GameStatus.Pause:
				if (prevStatus === GameStatus.InProgress) {
					this.modal.show({ type: ModalType.WelcomeScreen, topContent: GAME_PAUSED_MSG });
				}

				break;
			case GameStatus.InProgress:
				if (prevStatus === GameStatus.Pause) {
					this.modal.hide();
				}

				if (prevStatus === GameStatus.Finish) {
					this.renderer.reset();
				}

				break;
			default:
				break;
		}
	};

	private onInput = (input: PlayerInput): void => {
		this.ws.readyState === WebSocket.OPEN &&
			this.sendMsg({
				type: MessageType.USER_INPUT,
				data: input
			});
	};
}
