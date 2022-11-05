import { Direction, FireInput, MoveInput, Player } from '../../common/enums';
import { PlayerMode } from '../utils/enums';

const { Up, Down, Left, Right } = Direction;
const { P1, P2 } = Player;

export const inputToIdDirection = {
	[MoveInput.RUp]: { id: P2, direction: Up },
	[MoveInput.RDown]: { id: P2, direction: Down },
	[MoveInput.RLeft]: { id: P2, direction: Left },
	[MoveInput.RRight]: { id: P2, direction: Right },
	[MoveInput.LUp]: { id: P1, direction: Up },
	[MoveInput.LDown]: { id: P1, direction: Down },
	[MoveInput.LLeft]: { id: P1, direction: Left },
	[MoveInput.LRight]: { id: P1, direction: Right }
};

export const modeToInitialData = {
	[PlayerMode.SinglePlayer]: [{ direction: Right, id: Player.P1 }],
	[PlayerMode.Multiplayer]: [
		{ direction: Right, id: Player.P1 },
		{ direction: Left, id: Player.P2 }
	]
};

export const fireInputToPlayerId = {
	[FireInput.LFire]: Player.P1,
	[FireInput.RFire]: Player.P2
};
