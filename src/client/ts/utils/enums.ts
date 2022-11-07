import { FireInput, MoveInput, ServiceInput } from '../../../common/enums';

export enum KeyCode {
	ArrowUp = MoveInput.RUp,
	ArrowDown = MoveInput.RDown,
	ArrowLeft = MoveInput.RLeft,
	ArrowRight = MoveInput.RRight,
	Space = FireInput.RFire,
	Escape = ServiceInput.Escape,
	Enter = ServiceInput.Enter
}

export enum DrawingObject {
	Empty = 1,
	Player1 = 2,
	Player2 = 3,
	StandardCoin = 5,
	Bullet = 7,
	WinnersText = 8,
	IncScoreNotif = 9,
	DecScoreNotif = 10
}

export enum Layer {
	Presenter = 1,
	Stat = 2,
	Service = 3
}

export enum ModalType {
	WelcomeScreen = 1,
	GameOver = 2
}
