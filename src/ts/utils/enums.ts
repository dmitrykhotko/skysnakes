export enum Direction {
	Up = 1,
	Down = 2,
	Left = 3,
	Right = 4
}

export enum ActionInput {
	RFire = 5,
	LFire = 6
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

export enum ControlInput {
	Start = 9,
	Reset = 10,
	Empty = 11
}

export enum KeyCode {
	ArrowUp = 'ArrowUp',
	ArrowDown = 'ArrowDown',
	ArrowLeft = 'ArrowLeft',
	ArrowRight = 'ArrowRight',
	KeyW = 'KeyW',
	KeyS = 'KeyS',
	KeyA = 'KeyA',
	KeyD = 'KeyD',
	Space = 'Space'
}

export enum Player {
	P1 = 1,
	P2 = 2
}

export enum PlayerMode {
	SinglePlayer = 'single',
	Multiplayer = 'multi'
}

export enum ArenaType {
	Normal = 'normal',
	Soft = 'soft',
	Transparent = 'transparent'
}

export enum DrawGrid {
	Yes = 'yes',
	No = 'no'
}
