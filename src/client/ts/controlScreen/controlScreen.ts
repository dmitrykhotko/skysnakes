import { ServiceInput } from '../../../common/enums';
import { MessageType } from '../../../common/messageType';
import { AvailableRoom, Message, Observer, Room, UUId } from '../../../common/types';
import { WSHlp } from '../../../common/wSHlp';
import { KeyCode, ScreenType } from '../utils/enums';
import { CREATE_LABEL, CREATE_ROOM_LABEL, WRONG_LIVES_NUM_MSG, WRONG_ROOM_NAME_MSG } from '../utils/labels';
import {
	CONNECTION_LOST_SCREEN,
	CREATE_ROOM_FAIL_SCREEN,
	CREATE_ROOM_SCREEN,
	CREATE_ROOM_SUCCESS_SCREEN,
	GAME_PAUSED_SCREEN,
	JOIN_ROOM_FAIL_SCREEN,
	JOIN_ROOM_SCREEN,
	NO_ROOMS_AVAILABLE_SCREEN,
	PLAYER_DISCONNECTED_SCREEN,
	ROOM_IS_READY_SCREEN,
	WELCOME_SCREEN
} from '../utils/screens';

export class ControlScreen {
	private wS!: WebSocket;
	private screens!: Record<ScreenType, () => void>;
	private isCloseable = false;

	private el: HTMLElement;
	private contentEl: HTMLElement;
	private availableRoomsContainerEl: HTMLElement;
	private availableRoomsListEl: HTMLElement;
	private controlsEl: HTMLElement;
	private createRoomBtn: HTMLButtonElement;
	private joinRoomBtn: HTMLButtonElement;
	private closeBtn: HTMLButtonElement;

	constructor(wS: WebSocket, private onHide: Observer, roomUUId?: UUId) {
		this.el = document.querySelector('.js-ControlScreen') as HTMLElement;
		this.contentEl = this.el.querySelector('.js-Snakes__ControlScreenContent') as HTMLElement;
		this.availableRoomsContainerEl = this.el.querySelector('.js-Snakes__AvailableRoomsContainer') as HTMLElement;
		this.availableRoomsListEl = this.el.querySelector('.js-Snakes__AvailableRoomsList') as HTMLElement;
		this.controlsEl = this.el.querySelector('.js-Snakes__ControlScreenControls') as HTMLElement;
		this.createRoomBtn = this.el.querySelector('.js-Snakes__CreateRoom') as HTMLButtonElement;
		this.joinRoomBtn = this.el.querySelector('.js-Snakes__JoinRoom') as HTMLButtonElement;
		this.closeBtn = this.el.querySelector('.js-Snakes__ControlScreenClose') as HTMLButtonElement;

		this.initControls();
		this.initConnection(wS, roomUUId);
		this.initScreens();

		document.addEventListener('keydown', this.onGlobalKeyDown);
	}

	show = (type = ScreenType.Main): void => {
		this.isCloseable = false;
		this.screens[type]();
	};

	hide = (): void => {
		this.hideEls(this.el);
		this.onHide();
	};

	initConnection = (wS: WebSocket, roomUUId?: UUId): void => {
		this.wS = wS;

		if (roomUUId) {
			console.log(`Joining ${roomUUId} game.`);
			WSHlp.send(this.wS, MessageType.JOIN_ROOM, roomUUId);
		}

		this.wS.addEventListener('message', (event: MessageEvent): void => {
			const { t: type, d: data } = JSON.parse(event.data) as Message<unknown>;

			switch (type) {
				case MessageType.ROOM_IS_READY:
					this.showRoomIsReadyScreen();
					break;
				case MessageType.AVAILABLE_ROOMS_LIST:
					this.showAvailableRoomsListScreen(data as AvailableRoom[]);
					break;
				case MessageType.CREATE_ROOM_SUCCESS:
					this.showCreateRoomSuccessScreen(data as UUId);
					break;
				case MessageType.CREATE_ROOM_FAIL:
					this.showCreateRoomFailScreen();
					break;
				case MessageType.JOIN_ROOM_SUCCESS:
					this.showJoinRoomSuccessScreen(data as Room);
					break;
				case MessageType.JOIN_ROOM_FAIL:
					this.showJoinRoomFailScreen(data as UUId);
					break;
				default:
					break;
			}
		});
	};

	private initControls = (): void => {
		this.createRoomBtn.addEventListener('click', this.onCreateRoomBtnClick);
		this.joinRoomBtn.addEventListener('click', this.onJoinRoomBtnClick);
		this.closeBtn.addEventListener('click', this.onCloseBtnClick);
	};

	private initScreens = (): void => {
		this.screens = {
			[ScreenType.Main]: this.showMainScreen,
			[ScreenType.GamePaused]: this.showPauseScreen,
			[ScreenType.PlayerDisconnected]: this.showInfoScreen.bind(null, PLAYER_DISCONNECTED_SCREEN),
			[ScreenType.ConnectionLost]: this.showInfoScreen.bind(null, CONNECTION_LOST_SCREEN)
		};
	};

	private onCreateRoomBtnClick = (): void => {
		if (!this.contentEl.querySelector('.js-Snakes__CreateRoom')) {
			return this.showCreateRoomScreen();
		}

		const name = (this.contentEl.querySelector('.js-Snakes__RoomName') as HTMLInputElement)?.value;
		const validationMessageEl = this.contentEl.querySelector(
			'.js-Snakes__ControlScreenValidationMessage'
		) as HTMLElement;

		if (!name) {
			validationMessageEl.innerHTML = WRONG_ROOM_NAME_MSG;
			return;
		}

		const lives = parseInt((this.contentEl.querySelector('.js-Snakes__LivesNum') as HTMLInputElement)?.value);

		if (!(lives > 0)) {
			validationMessageEl.innerHTML = WRONG_LIVES_NUM_MSG;
			return;
		}

		WSHlp.send(this.wS, MessageType.CREATE_ROOM, { name, lives });
		this.createRoomBtn.innerHTML = CREATE_ROOM_LABEL;
	};

	private onJoinRoomBtnClick = (): void => {
		WSHlp.send(this.wS, MessageType.QUIT_WAITING_ROOM);

		this.getAvailableRooms();
		this.setScreen(JOIN_ROOM_SCREEN);
	};

	private onCloseBtnClick = (): void => {
		this.hide();
		this.onHide(ServiceInput.Escape);
	};

	private onAvailableRoomClick = (e: Event): void => {
		const targetEl = e.target as HTMLElement;

		if (!(targetEl && targetEl.classList.contains('js-Snakes__AvailableRoomLink'))) {
			return;
		}

		const uuid = targetEl.dataset.uuid;

		WSHlp.send(this.wS, MessageType.JOIN_ROOM, uuid);
	};

	private onGlobalKeyDown = (event: KeyboardEvent): void => {
		if (!this.isCloseable) {
			return;
		}

		const playerInput = +KeyCode[event.code as unknown as KeyCode];

		if (playerInput === ServiceInput.Enter || playerInput === ServiceInput.Escape) {
			this.hide();
			this.onHide && this.onHide(playerInput);
		}

		event.stopPropagation();
	};

	private showMainScreen = (): void => {
		this.setScreen(WELCOME_SCREEN);
		this.hideEls(this.availableRoomsContainerEl, this.closeBtn);
		this.showEls(this.el, this.controlsEl);

		this.createRoomBtn.focus();
	};

	private showPauseScreen = (): void => {
		this.showInfoScreen(GAME_PAUSED_SCREEN, true);

		const quitBtn = this.contentEl.querySelector('.js-Snakes__QuitToMainMenu') as HTMLButtonElement;
		quitBtn.addEventListener('click', this.quitGame);
	};

	private showInfoScreen = (screen: string, isCloseable = false): void => {
		this.setScreen(screen);
		this.hideEls(this.controlsEl, this.availableRoomsContainerEl);
		this.showEls(this.el);

		this.isCloseable = isCloseable;
		this.isCloseable && this.showEls(this.closeBtn);
	};

	private showCreateRoomScreen = (): void => {
		WSHlp.send(this.wS, MessageType.QUIT_WAITING_ROOM);

		this.hideEls(this.availableRoomsContainerEl);
		this.setScreen(CREATE_ROOM_SCREEN);

		this.createRoomBtn.innerHTML = CREATE_LABEL;

		const roomNameInpt = this.contentEl.querySelector('.js-Snakes__RoomName') as HTMLInputElement;
		const liveNumInpt = this.contentEl.querySelector('.js-Snakes__LivesNum') as HTMLInputElement;

		this.bindOnEnter(liveNumInpt, this.onCreateRoomBtnClick);
		this.bindOnEnter(roomNameInpt, liveNumInpt.focus.bind(liveNumInpt) as Observer);

		roomNameInpt.focus();
	};

	private showCreateRoomSuccessScreen = (uuid: UUId): void => {
		this.hideEls(this.availableRoomsContainerEl);
		this.setScreen(CREATE_ROOM_SUCCESS_SCREEN);

		const gameUrl = this.createRoomUrl(uuid);

		void navigator.clipboard.writeText(gameUrl);
		console.log(`New game starts here ${gameUrl}`);
	};

	private showCreateRoomFailScreen = (): void => this.setScreen(CREATE_ROOM_FAIL_SCREEN);

	private showAvailableRoomsListScreen = (uuids: AvailableRoom[]): void => {
		if (!uuids.length) {
			this.hideEls(this.availableRoomsContainerEl);
			this.setScreen(NO_ROOMS_AVAILABLE_SCREEN);

			this.availableRoomsListEl.innerHTML = '';

			return;
		}

		this.availableRoomsListEl.innerHTML = uuids.reduce((acc, { uuid, name }) => {
			return `
				${acc}
				<li class="Snakes__AvailableRoom">
					<a class="btn Snakes__AvailableRoomLink js-Snakes__AvailableRoomLink" data-uuid="${uuid}">${name}</a>
				</li>
			`;
		}, '');

		this.availableRoomsListEl.addEventListener('click', this.onAvailableRoomClick);
		this.showEls(this.availableRoomsContainerEl);
	};

	private showJoinRoomSuccessScreen = (room: Room): void => {
		this.hideEls(this.availableRoomsContainerEl);
		console.log(`You've joined room ${room.name}`);
	};

	private showJoinRoomFailScreen = (uuid: UUId): void => {
		this.setScreen(JOIN_ROOM_FAIL_SCREEN.replace('#{room}', `{ ${uuid} }`));
	};

	private showRoomIsReadyScreen = (): void => this.showInfoScreen(ROOM_IS_READY_SCREEN);

	private showEls = (...els: HTMLElement[]): void => {
		els.forEach(el => el.classList.remove('-hidden'));
	};

	private hideEls = (...els: HTMLElement[]): void => {
		els.forEach(el => el.classList.add('-hidden'));
	};

	private getAvailableRooms = (): void => {
		WSHlp.send(this.wS, MessageType.GET_AVAILABLE_ROOMS_LIST);
	};

	private createRoomUrl = (uuid: UUId): string => `${location.origin}?room=${uuid}`;

	private setScreen = (content: string): void => void (this.contentEl.innerHTML = content);

	private bindOnEnter = (el: HTMLElement, action: Observer): void =>
		el.addEventListener('keydown', event => event.code === 'Enter' && action());

	private quitGame = (): void => window.location.reload();
}
