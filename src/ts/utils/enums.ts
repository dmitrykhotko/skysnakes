// get rid of defining enum values

export enum GameStatus {
	InProgress = 1,
	Pause = 2,
	Stop = 3
}

export enum Direction {
	Up = 1,
	Down = 2,
	Left = 3,
	Right = 4
}

export enum Position {
	Top,
	Left,
	Bottom,
	Right
}

export enum MoveInput {
	RUp = 1,
	RDown = 2,
	RLeft = 3,
	RRight = 4,
	LUp = 5,
	LDown = 6,
	LLeft = 7,
	LRight = 8
}

export enum FireInput {
	RFire = 9,
	LFire = 10
}

export enum ServiceInput {
	Escape = 11,
	Enter = 12
}

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

export enum Player {
	P1 = 1,
	P2 = 2
}

export enum PlayerMode {
	SinglePlayer = 'single',
	Multiplayer = 'multi'
}

export enum Strategy {
	Normal = 'normal',
	Soft = 'soft',
	Transparent = 'transparent'
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

export enum DamageType {
	headShot = 1,
	death = 2,
	standard = 3
}

export enum Layer {
	Presenter = 1,
	Stat = 2,
	Service = 3
}

export enum CoinType {
	Standard = 1,
	DeathPlayer1 = 2,
	DeathPlayer2 = 3
	// Large = 4,
	// Super = 5
}

export enum NotifType {
	IncScore = 1,
	DecScore = 2
}
