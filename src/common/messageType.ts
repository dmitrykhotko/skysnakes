// CLIENT MESSAGES

export enum MessageType {
	// messages from client
	SET_SIZE = 'CLIENT/SET_SIZE',
	USER_INPUT = 'CLIENT/USER_INPUT',

	// messages from server
	START = 'SERVER/START',
	TICK = 'SERVER/TICK'
}
