import { FireInput, Strategy, Direction, MoveInput, Player, PlayerMode } from '../../utils/enums';
import { Size } from '../../utils/types';
import { NormalStrategy, SoftWallsStrategy, TransparentWallsStrategy } from '../arena/strategies';
import { Renderer } from '../renderers/renderer';

const { Up, Down, Left, Right } = Direction;
const { P1, P2 } = Player;

export type ControllerProps = {
	renderer: Renderer;
	size: Size;
	autostart?: boolean;
};

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

export const toDirectionsAndPlayers = {
	[PlayerMode.SinglePlayer]: [{ direction: Right, id: Player.P1 }],
	[PlayerMode.Multiplayer]: [
		{ direction: Right, id: Player.P1 },
		{ direction: Left, id: Player.P2 }
	]
};

export const arenaStrategies = {
	[Strategy.Normal]: NormalStrategy,
	[Strategy.Soft]: SoftWallsStrategy,
	[Strategy.Transparent]: TransparentWallsStrategy
};

export const defaultProps = {
	autostart: false
};

export const fireInputToPlayerId = {
	[FireInput.LFire]: Player.P1,
	[FireInput.RFire]: Player.P2
};
