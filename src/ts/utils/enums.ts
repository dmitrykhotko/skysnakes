// get rid of defining enum values

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

export enum ControlInput {
	Start = 11,
	Reset = 12,
	Empty = 13
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
	Space = FireInput.RFire
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

export enum DrawGrid {
	Yes = 'yes',
	No = 'no'
}

export enum DrawingObject {
	empty = 1,
	head1 = 2,
	head2 = 3,
	body = 4,
	coin = 5,
	grid = 6,
	bullet = 7
}
