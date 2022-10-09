import { HEIGHT, WIDTH } from '../../utils/constants';
import { FireInput, Strategy, Direction, MoveInput, Player, PlayerMode } from '../../utils/enums';
import { NormalStrategy, SoftWallsStrategy, TransparentWallsStrategy } from '../arena/strategies';
import { Renderer } from '../renderers/renderer';

const { Up, Down, Left, Right } = Direction;
const { P1, P2 } = Player;

export type ControllerProps = {
	renderer: Renderer;
	width?: number;
	height?: number;
	autostart?: boolean;
	onStart: () => void;
	onFinish: () => void;
};

export const inputToIdDirection = {
	[MoveInput.RUp]: { id: P1, direction: Up },
	[MoveInput.RDown]: { id: P1, direction: Down },
	[MoveInput.RLeft]: { id: P1, direction: Left },
	[MoveInput.RRight]: { id: P1, direction: Right },
	[MoveInput.LUp]: { id: P2, direction: Up },
	[MoveInput.LDown]: { id: P2, direction: Down },
	[MoveInput.LLeft]: { id: P2, direction: Left },
	[MoveInput.LRight]: { id: P2, direction: Right }
};

export const toDirectionsAndPlayers = {
	[PlayerMode.SinglePlayer]: [{ direction: Right, id: Player.P1 }],
	[PlayerMode.Multiplayer]: [
		{ direction: Left, id: Player.P1 },
		{ direction: Right, id: Player.P2 }
	]
};

export const arenaStrategies = {
	[Strategy.Normal]: NormalStrategy,
	[Strategy.Soft]: SoftWallsStrategy,
	[Strategy.Transparent]: TransparentWallsStrategy
};

export const defaultProps = {
	width: WIDTH,
	height: HEIGHT,
	autostart: false
};

export const fireInputToPlayer = {
	[FireInput.RFire]: Player.P1,
	[FireInput.LFire]: Player.P2
};
