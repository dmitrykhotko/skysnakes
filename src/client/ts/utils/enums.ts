// get rid of defining enum values

import { FireInput, MoveInput, ServiceInput } from '../../../common/enums';

export enum KeyCode {
	ArrowUp = MoveInput.RUp,
	ArrowDown = MoveInput.RDown,
	ArrowLeft = MoveInput.RLeft,
	ArrowRight = MoveInput.RRight,
	KeyW = MoveInput.LUp,
	KeyS = MoveInput.LDown,
	KeyA = MoveInput.LLeft,
	KeyD = MoveInput.LRight,
	Tab = FireInput.LFire,
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
