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

export enum MoveInput {
	RUp = 1,
	RDown = 2,
	RLeft = 3,
	RRight = 4
}

export enum FireInput {
	RFire = 9
}

export enum ServiceInput {
	Escape = 11,
	Enter = 12
}

export enum Player {
	P1 = 1,
	P2 = 2
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
