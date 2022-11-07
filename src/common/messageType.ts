// CLIENT MESSAGES

export enum MessageType {
	// messages from client
	SET_SIZE = 'CLIENT/SET_SIZE',
	USER_INPUT = 'CLIENT/USER_INPUT',

	// messages from server
	GET_SIZE = 'SERVER/GET_SIZE',
	START = 'SERVER/START',
	TICK = 'SERVER/TICK',
	PLAYER_DISCONNECTED = 'SERVER/PLAYER_DISCONNECTED'
}
