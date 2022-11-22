export const WELCOME_SCREEN = `
	<h3>WELCOME TO THE SKY SNAKES</h3>
	<p>Collect coins, go through the walls, SHOOT each other, have fun!</p>
	<br />
	<p>Controls:</p>
	<p>Arrows — move, Space — shoot,</p>
	<p>ESC — play/pause, Enter — restart.</p>
`;

export const GAME_PAUSED_SCREEN = `
	<h3>Game paused.</h3>
	<br />
	<p>Controls:</p>
	<p>Arrows — move, Space — shoot,</p>
	<p>ESC — play/pause, Enter — restart.</p>
	<button class="Snakes__QuitToMainMenu js-Snakes__QuitToMainMenu btn">Quit to main menu</button>
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
	<h3>We're almost ready to play.</h3>
	<p>The game starts in a few seconds.</p>
`;

export const CREATE_ROOM_SCREEN = `
	<h3 class="js-Snakes__CreateRoom">Create room</h3>
	<p>Please enter the name and lives number:</p>
	<input class="Snakes__RoomName js-Snakes__RoomName inpt" placeholder="room name">
	<input class="Snakes__LivesNum js-Snakes__LivesNum inpt" type="number" min="1" pattern="[0-9]" placeholder="lives number">
	<span class="Snakes__ControlScreenValidationMessage js-Snakes__ControlScreenValidationMessage"></span>
`;

export const CREATE_ROOM_SUCCESS_SCREEN = `
	<p>Room was created successfully. The room link is copied to the clipboard.</p>
	<p>You can send it to the second player to join.</p>
	<p>Otherwise player can join using Join button.</p>
`;

export const CREATE_ROOM_SUCCESS_SCREEN_NO_CLIPBOARD = `
	<p>Room was created successfully.</p>
	<p>Please ask another player to join by Join button.</p>
`;

export const CREATE_ROOM_FAIL_SCREEN = `
	<p>Room creation is failed. Sorry.</p>
	<p>Please try once again.</p>
`;

export const JOIN_ROOM_SCREEN = `
	<h3>Join room</h3>
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
