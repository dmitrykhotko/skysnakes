export const WINNER = 'WINNER ';
export const WINNERS = 'WINNERS ';
export const PLAYER = 'Player:';
export const LIVES = 'Lives:';
export const SCORE = 'Score:';
export const HEAD = 'HEAD';
export const X = 'x:';
export const Y = 'y:';

export const RESTART_MSG = 'Press Esc / Enter to restart';
export const PLEASE_WAIT_THE_SECOND_PLAYER = '(Please wait the second player)';
export const CONNECTION_LOST = '(Connection lost)';

export const SCORE_SEPARATOR = ':';

export const SOUND_ON = 'Sound On';
export const SOUND_OFF = 'Sound Off';
export const JOIN_ROOM_LABEL = 'JOIN ROOM';
// export const JOIN_ROOM_ANOTHER_LABEL = 'JOIN ANOTHER ROOM';
export const CREATE_ROOM_LABEL = 'CREATE ROOM';
export const CREATE_LABEL = 'CREATE';

export const WELCOME_SCREEN = `
	<h3>WELCOME TO THE SKY SNAKES</h3>
	<p>Collect coins, go through the walls, SHOOT each other, have fun!</p>
	<p>Controls:</p>
	<p>Arrows — move, Space — shoot,</p>
	<p>ESC — play/pause, Enter — restart.</p>
`;

export const GAME_PAUSED_SCREEN = `
	<h3>Game paused.</h3>
	<p>Controls:</p>
	<p>Arrows — move, Space — shoot,</p>
	<p>ESC — play/pause, Enter — restart.</p>
`;

export const GAME_OVER_SCREEN = `
	<h3>Game over :(</h3>
`;

export const PLAYER_DISCONNECTED_SCREEN = `
	<p>The second player was disconnected.</p>
	<p>You'll be redirected to the Main menu.</p>
`;

export const ROOM_IS_READY_SCREEN = `
	<p>We're almost ready to play.</p>
	<p>The game will start in a few seconds.</p>
`;

export const CREATE_ROOM_SCREEN = `
	<p>Please enter the room name</p>
	<input class="Snakes__RoomName js-Snakes__RoomName inpt">
`;

export const CREATE_ROOM_SUCCESS_SCREEN = `
	<p>Room was created successfully. The link is copied to the clipboard.</p>
	<p>Please send it to the second player to join.</p>
`;

export const CREATE_ROOM_FAIL_MSG = `
	<p>Room creation is failed. Sorry.</p>
	<p>Please try once again.</p>
`;

export const JOIN_ROOM_SCREEN = `
	<p>Please select the room to join</p>
`;

export const JOIN_ROOM_FAIL_SCREEN = `
	<p>Joining room #{room} is failed. Sorry.</p>
	<p>Please create or join another room.</p>
`;

export const NO_ROOMS_AVAILABLE_SCREEN = `
	<p>No available rooms.</p>
	<p>Please create a new one or try later.</p>
`;
