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

export const PLAYER_DISCONNECTED_SCREEN = `
	<h3>Game over :(</h3>
	<p>The second player was disconnected.</p>
	<p>You'll be redirected to the Main menu.</p>
`;

export const CONNECTION_LOST_SCREEN = `
	<h3>Game over :(</h3>
	<p>Connection lost.</p>
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

export const CREATE_ROOM_FAIL_SCREEN = `
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