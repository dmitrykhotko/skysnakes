import { GameStatus } from '../../../common/enums';
import { MessageType } from '../../../common/messageType';
import { GameState, Message, Observer, PlayerInput, Size } from '../../../common/types';
import { ControlsManager } from '../controlsManager/controlsManager';
import { Modal } from '../modal/modal';
import { CanvasRenderer, CanvasRendererProps } from '../renderers/instances/canvasRenderer';
import { WELCOME_MESSAGE } from '../utils/labels';

export class Controller {
	private prevState?: GameState;
	private renderer: CanvasRenderer;
	private controls: ControlsManager;
	private modal: Modal;
	private ws!: WebSocket;

	constructor(rProps: CanvasRendererProps, size: Size, serviceInfoFlag = false) {
		const onInputObserver = this.onInput as Observer;

		this.renderer = new CanvasRenderer(rProps, onInputObserver, serviceInfoFlag);
		this.controls = new ControlsManager(this.renderer.focus);
		this.modal = new Modal(WELCOME_MESSAGE, ((input: PlayerInput): void => {
			this.onInput(input);
			this.renderer.focus();
		}) as Observer);

		this.initConnection(size);
		this.modal.show();
	}

	private initConnection = (size: Size): void => {
		this.ws = new WebSocket('ws://localhost:8080');

		this.ws.onopen = (): void => {
			console.log('Connection established.');

			this.ws.send(
				JSON.stringify({
					type: MessageType.SET_SIZE,
					data: size
				})
			);
		};

		this.ws.onmessage = (event: MessageEvent): void => {
			const { type, data } = JSON.parse(event.data) as Message<unknown>;

			switch (type) {
				case MessageType.START:
					this.start();
					break;
				case MessageType.TICK:
					this.tick(data as GameState);

					break;
				default:
					break;
			}
		};

		this.ws.onclose = (): void => {
			console.log('Connection closed.');
		};
	};

	private tick = (state: GameState): void => {
		this.renderer.render(state);
		this.checkStatusChanged(state.status);

		this.prevState = state;
	};

	private checkStatusChanged = (status: GameStatus): void => {
		const prevStatus = this.prevState?.status ?? GameStatus.Pause;

		switch (status) {
			case GameStatus.Pause:
				if (prevStatus === GameStatus.InProgress) {
					this.modal.show();
				}

				break;
			case GameStatus.InProgress:
				if (prevStatus === GameStatus.Pause) {
					this.modal.hide();
				}

				break;
			default:
				break;
		}
	};

	private onInput = (input: PlayerInput): void => {
		this.ws.readyState === WebSocket.OPEN &&
			this.ws.send(
				JSON.stringify({
					type: MessageType.USER_INPUT,
					data: input
				})
			);
	};

	private start = (): void => {
		this.renderer.reset();
		this.renderer.focus();
	};
}
