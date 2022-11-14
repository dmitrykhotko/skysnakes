import { MessageType } from '../../../common/messageType';
import { AvailableRoom, Message, Room, UUId } from '../../../common/types';
import { WSHlp } from '../../../common/wSHlp';
import { CREATE_LABEL } from '../utils/labels';
import {
	CREATE_ROOM_FAIL_MSG,
	CREATE_ROOM_LABEL,
	CREATE_ROOM_SCREEN,
	CREATE_ROOM_SUCCESS_SCREEN,
	JOIN_ROOM_FAIL_SCREEN,
	JOIN_ROOM_SCREEN,
	NO_ROOMS_AVAILABLE_SCREEN,
	ROOM_IS_READY_SCREEN,
	WELCOME_SCREEN
} from '../utils/screens';

export class ControlScreen {
	private el: HTMLElement;
	private contentEl: HTMLElement;
	private availableRoomsContainerEl: HTMLElement;
	private availableRoomsListEl: HTMLElement;
	private createRoomBtn: HTMLButtonElement;
	private joinRoomBtn: HTMLButtonElement;
	private lastBtn?: HTMLButtonElement;

	constructor(private wS: WebSocket, roomUUId?: UUId) {
		this.el = document.querySelector('.js-StartGame') as HTMLElement;
		this.contentEl = this.el.querySelector('.js-Snakes__ControlScreenContent') as HTMLElement;
		this.availableRoomsContainerEl = this.el.querySelector('.js-Snakes__AvailableRoomsContainer') as HTMLElement;
		this.availableRoomsListEl = this.el.querySelector('.js-Snakes__AvailableRoomsList') as HTMLElement;
		this.createRoomBtn = this.el.querySelector('.js-Snakes__CreateRoom') as HTMLButtonElement;
		this.joinRoomBtn = this.el.querySelector('.js-Snakes__JoinRoom') as HTMLButtonElement;

		this.initControls();
		this.initConnection(roomUUId);
	}

	showModal = (): void => {
		this.showWelcomeScreen();
		this.show(this.el);
		this.createRoomBtn.focus();
	};

	hideModal = (): void => {
		this.hide(this.el);
	};

	private initControls = (): void => {
		this.createRoomBtn.addEventListener('click', this.onCreateRoomBtnClick);
		this.joinRoomBtn.addEventListener('click', this.onJoinRoomBtnClick);
	};

	private initConnection = (roomUUId?: UUId): void => {
		if (roomUUId) {
			console.log(`Joining ${roomUUId} game.`);
			WSHlp.send(this.wS, MessageType.JOIN_ROOM, roomUUId);
		}

		this.wS.addEventListener('message', (event: MessageEvent): void => {
			const { type, data } = JSON.parse(event.data) as Message<unknown>;

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

	private onCreateRoomBtnClick = (): void => {
		this.lastBtn === this.createRoomBtn ? this.createRoom() : this.showCreateRoomScreen();
	};

	private onJoinRoomBtnClick = (): void => {
		WSHlp.send(this.wS, MessageType.QUIT_ROOM);

		this.lastBtn = undefined;
		this.getAvailableRooms();
		this.setContent(JOIN_ROOM_SCREEN);
	};

	private onRoomNameInputKeydown = (event: KeyboardEvent): void => {
		event.code === 'Enter' && this.onCreateRoomBtnClick();
	};

	private onAvailableRoomClick = (e: Event): void => {
		const targetEl = e.target as HTMLElement;

		if (!(targetEl && targetEl.classList.contains('js-Snakes__AvailableRoomLink'))) {
			return;
		}

		const uuid = targetEl.dataset.uuid;

		WSHlp.send(this.wS, MessageType.JOIN_ROOM, uuid);
	};

	private showWelcomeScreen = (): void => {
		this.setContent(WELCOME_SCREEN);
		this.hide(this.availableRoomsContainerEl);
	};

	private showCreateRoomScreen = (): void => {
		WSHlp.send(this.wS, MessageType.QUIT_ROOM);

		this.hide(this.availableRoomsContainerEl);
		this.setContent(CREATE_ROOM_SCREEN);

		this.createRoomBtn.innerHTML = CREATE_LABEL;
		this.lastBtn = this.createRoomBtn;

		const roomNameInput = this.contentEl.querySelector('.js-Snakes__RoomName') as HTMLInputElement;

		roomNameInput.addEventListener('keydown', this.onRoomNameInputKeydown);
		roomNameInput.focus();
	};

	private showCreateRoomSuccessScreen = (uuid: UUId): void => {
		this.hide(this.availableRoomsContainerEl);
		this.setContent(CREATE_ROOM_SUCCESS_SCREEN);

		const gameUrl = this.createRoomUrl(uuid);

		void navigator.clipboard.writeText(gameUrl);
		console.log(`New game starts here ${gameUrl}`);
	};

	private showCreateRoomFailScreen = (): void => this.setContent(CREATE_ROOM_FAIL_MSG);

	private showAvailableRoomsListScreen = (uuids: AvailableRoom[]): void => {
		if (!uuids.length) {
			this.hide(this.availableRoomsContainerEl);
			this.setContent(NO_ROOMS_AVAILABLE_SCREEN);

			this.availableRoomsListEl.innerHTML = '';

			return;
		}

		this.availableRoomsListEl.innerHTML = uuids.reduce((acc, { uuid, name }) => {
			return `
			${acc}<li class="Snakes__AvailableRoom">
				<a class="btn Snakes__AvailableRoomLink js-Snakes__AvailableRoomLink" data-uuid="${uuid}">${name}</a>
			</li>
		`;
		}, '');

		this.availableRoomsListEl.addEventListener('click', this.onAvailableRoomClick);
		this.show(this.availableRoomsContainerEl);
	};

	private showJoinRoomSuccessScreen = (room: Room): void => {
		this.hide(this.availableRoomsContainerEl);
		console.log(`You've joined room ${room.name}`);
	};

	private showJoinRoomFailScreen = (uuid: UUId): void => {
		const screen = JOIN_ROOM_FAIL_SCREEN.replace('#{room}', uuid);

		this.setContent(screen);
		this.getAvailableRooms();
	};

	private showRoomIsReadyScreen = (): void => this.setContent(ROOM_IS_READY_SCREEN);

	private createRoom = (): void => {
		const roomName = (this.contentEl.querySelector('.js-Snakes__RoomName') as HTMLInputElement)?.value;

		if (!roomName) {
			return;
		}

		this.createRoomBtn.innerHTML = CREATE_ROOM_LABEL;
		this.lastBtn = undefined;
		WSHlp.send(this.wS, MessageType.CREATE_ROOM, roomName);
	};

	private show = (el: HTMLElement): void => {
		el.classList.remove('-hidden');
	};

	private hide = (el: HTMLElement): void => {
		el.classList.add('-hidden');
	};

	private getAvailableRooms = (): void => {
		WSHlp.send(this.wS, MessageType.GET_AVAILABLE_ROOMS_LIST);
	};

	private createRoomUrl = (uuid: UUId): string => `${location.origin}?room=${uuid}`;

	private setContent = (content: string): void => void (this.contentEl.innerHTML = content);
}
