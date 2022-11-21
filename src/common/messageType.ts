export enum MessageType {
	// messages from client
	CREATE_ROOM,
	GET_AVAILABLE_ROOMS_LIST,
	JOIN_ROOM,
	SET_SIZE,
	USER_INPUT,
	QUIT_WAITING_ROOM,

	// messages from server
	CREATE_ROOM_SUCCESS,
	CREATE_ROOM_FAIL,
	JOIN_ROOM_SUCCESS,
	JOIN_ROOM_FAIL,
	ROOM_IS_READY,
	AVAILABLE_ROOMS_LIST,
	GET_SIZE,
	START,
	TICK,
	PLAYER_DISCONNECTED
}

// export const MessageTypeC = {
// 	// messages from client
// 	[MessageType.CREATE_ROOM]: 1,
// 	[MessageType.GET_AVAILABLE_ROOMS_LIST]: 2,
// 	[MessageType.JOIN_ROOM]: 3,
// 	[MessageType.SET_SIZE]: 4,
// 	[MessageType.USER_INPUT]: 5,
// 	[MessageType.QUIT_WAITING_ROOM]: 6,

// 	// messages from server
// 	[MessageType.CREATE_ROOM_SUCCESS]: 7,
// 	[MessageType.CREATE_ROOM_FAIL]: 8,
// 	[MessageType.JOIN_ROOM_SUCCESS]: 9,
// 	[MessageType.JOIN_ROOM_FAIL]: 10,
// 	[MessageType.ROOM_IS_READY]: 11,
// 	[MessageType.AVAILABLE_ROOMS_LIST]: 12,
// 	[MessageType.GET_SIZE]: 13,
// 	[MessageType.START]: 14,
// 	[MessageType.TICK]: 15,
// 	[MessageType.PLAYER_DISCONNECTED]: 16
// };
