export enum MessageType {
    // messages from server
    TICK,
    CREATE_ROOM_SUCCESS,
    CREATE_ROOM_FAIL,
    JOIN_ROOM_SUCCESS,
    JOIN_ROOM_FAIL,
    ROOM_IS_READY,
    AVAILABLE_ROOMS_LIST,
    GET_SIZE,
    SET_SIZE,
    START,
    PLAYER_DISCONNECTED,

    // messages from client
    CREATE_ROOM,
    GET_AVAILABLE_ROOMS_LIST,
    JOIN_ROOM,
    SEND_SIZE,
    USER_INPUT,
    QUIT_WAITING_ROOM,
    PLAYER_IS_READY
}
