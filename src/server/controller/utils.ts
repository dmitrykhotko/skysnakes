import { Direction, FireInput, MoveInput, Player } from '../../common/enums';
import { PlayerMode } from '../utils/enums';

const { Up, Down, Left, Right } = Direction;

export const inputToDirection = {
	[MoveInput.RUp]: Up,
	[MoveInput.RDown]: Down,
	[MoveInput.RLeft]: Left,
	[MoveInput.RRight]: Right
};

export const modeToInitialData = {
	[PlayerMode.SinglePlayer]: [{ direction: Right, id: Player.P1 }],
	[PlayerMode.Multiplayer]: [
		{ direction: Right, id: Player.P1 },
		{ direction: Left, id: Player.P2 }
	]
};
