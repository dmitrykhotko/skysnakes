// GAME DEFAULTS

export const WIDTH = 40;
export const HEIGHT = 20;
export const TEXT_AREA_WIDTH = 200;
export const SNAKE_LENGTH = 3;
export const GAME_SPEED = 10;

// DEV SETTINGS

export const TRACE_STATE = false;

// ACTIONS

//// ARENA ACTIONS
export const SET_COIN = 'ARENA/SET_COIN';
export const INC_COINS = 'ARENA/INC_COINS';
export const SET_IN_PROGRESS = 'ARENA/SET_IN_PROGRESS';
export const SET_LOOSERS = 'ARENA/SET_LOOSERS';
export const SET_SCORE = 'ARENA/SET_SCORE';
export const INC_DEATHS = 'ARENA/INC_DEATHS';
export const SET_DEATHS = 'ARENA/SET_DEATHS';
export const SET_STRATEGY = 'ARENA/SET_STRATEGY';

//// USER SETTINGS ACTIONS

export const SET_PLAYER_MODE = 'USER_SETTINGS/SET_PLAYER_MODE';
export const SET_ARENA_TYPE = 'USER_SETTINGS/SET_ARENA_TYPE';
export const SET_DRAW_GRID = 'USER_SETTINGS/SET_DRAW_GRID';
export const SET_DEATHS_NUM = 'USER_SETTINGS/SET_DEATHS_NUM';

//// INPUT ACTIONS

export const SET_DIRECTION = 'INPUT/SET_DIRECTION';
export const SET_START = 'INPUT/SET_START';
export const SET_RESET = 'INPUT/SET_RESET';
export const RELEASE_CONTROL_INPUT = 'INPUT/RELEASE_CONTROL_INPUT';

//// SNAKES ACTIONS

export const SET_SNAKE = 'SNAKE/SET_SNAKE';
export const SET_HEAD = 'SNAKE/SET_HEAD';
export const SET_TAIL = 'SNAKE/SET_TAIL';
export const SEND_DIRECTION = 'SNAKES/SEND_DIRECTION';
