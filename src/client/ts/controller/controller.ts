import { GameStatus } from '../../../common/enums';
import { MessageType } from '../../../common/messageType';
import { GameState, Message, Observer, PlayerInput, Size, UUId } from '../../../common/types';
import { WSHlp } from '../../../common/wSHlp';
import { ControlPanel } from '../controlPanel/controlPanel';
import { ControlScreen } from '../controlScreen/controlScreen';
import { Modal } from '../modal/modal';
import { CanvasRenderer } from '../renderers/instances/canvasRenderer';
import { ModalType } from '../utils/enums';
import { CONNECTION_LOST } from '../utils/labels';
import { PLAYER_DISCONNECTED_SCREEN } from '../utils/screens';
import { CanvasRendererProps, GameProps } from '../utils/types';

export class Controller {
	private wS!: WebSocket;
	private controlScreen!: ControlScreen;
	private prevState?: GameState;
	private renderer: CanvasRenderer;
	private modal: Modal;

	constructor({ roomUUId, showServiceInfo = false }: GameProps, rProps: CanvasRendererProps, size: Size) {
		const onInputObserver = this.onInput as Observer;

		this.renderer = new CanvasRenderer(rProps, onInputObserver, showServiceInfo);
		this.modal = new Modal(((input: PlayerInput): void => {
			this.onInput(input);
			this.renderer.focus();
		}) as Observer);

		new ControlPanel(this.renderer.focus);
		this.initConnection(size, roomUUId);
	}

	private initConnection = (size: Size, roomUUId?: UUId): void => {
		const { hostname } = location;
		const wSUrl = `ws://${hostname}:8080`;

		this.wS = new WebSocket(wSUrl);

		this.wS.addEventListener('open', (): void => {
			console.log(`Connection to ${wSUrl} established.`);

			this.controlScreen = new ControlScreen(this.wS, roomUUId);
			this.controlScreen.showModal();
		});

		this.wS.addEventListener('message', (event: MessageEvent): void => {
			const { type, data } = JSON.parse(event.data) as Message<unknown>;

			switch (type) {
				case MessageType.GET_SIZE:
					WSHlp.send(this.wS, MessageType.SET_SIZE, size);

					break;
				case MessageType.START:
					this.handleStartMsg();

					break;
				case MessageType.TICK:
					this.handleTickMsg(data as GameState);

					break;
				case MessageType.PLAYER_DISCONNECTED:
					this.handleGameOverMsg(PLAYER_DISCONNECTED_SCREEN);

					setTimeout(() => {
						this.modal.hide();
						this.controlScreen.showModal();
					}, 3000);
					break;
				default:
					break;
			}
		});

		this.wS.onclose = (): void => {
			console.log(`Connection to ${wSUrl} closed.`);
			this.handleGameOverMsg(CONNECTION_LOST);
		};
	};

	private handleStartMsg = (): void => {
		this.modal.hide();
		this.controlScreen.hideModal();
		this.renderer.reset();
		this.renderer.focus();
	};

	private handleTickMsg = (state: GameState): void => {
		this.checkStatusChanged(state.status);
		this.renderer.render(state);

		this.prevState = state;
	};

	private handleGameOverMsg = (message = '', isStatic = true): void => {
		this.controlScreen.hideModal();
		this.modal.hide();
		this.modal.show({ type: ModalType.GameOver, bottomContent: message, isStatic });
	};

	private checkStatusChanged = (status: GameStatus): void => {
		const prevStatus = this.prevState?.status ?? GameStatus.Pause;

		switch (status) {
			case GameStatus.Pause:
				if (prevStatus === GameStatus.InProgress) {
					this.modal.show({ type: ModalType.GamePaused });
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
		this.wS.readyState === WebSocket.OPEN && WSHlp.send(this.wS, MessageType.USER_INPUT, input);
	};
}
