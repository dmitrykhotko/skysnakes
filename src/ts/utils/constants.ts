// GAME DEFAULTS

export const WIDTH = 120;
export const HEIGHT = 60;

export const TEXT_AREA_WIDTH = 200;
export const CELL_SIZE = 25;
export const LINE_HEIGHT = 40;

export const SNAKE_LENGTH = 30;

export const GAME_SPEED = 30; // Valid values are 60,30,20,15,10...
export const SNAKE_SPEED = 1;
export const BULLET_SPEED = 2;

export const COIN_WEIGHT = 1;
export const HEAD_SHOT_WEIGHT = 10;
export const BODY_PART_WEIGHT = 1;
export const FRIENDLY_FIRE_WEIGHT = 0.5;

// DEV SETTINGS

export const TRACE_STATE = false;

// ACTIONS

//// COMMON_ACTIONS

export const RESET_GAME = 'COMMON_ACTIONS/RESET_GAME';

//// ARENA ACTIONS
export const SET_COIN = 'ARENA/SET_COIN';
export const INC_COINS = 'ARENA/INC_COINS';
export const ADD_COINS = 'ARENA/ADD_COINS';
export const SET_IN_PROGRESS = 'ARENA/SET_IN_PROGRESS';
export const SET_LOOSERS = 'ARENA/SET_LOOSERS';
export const SET_SCORE = 'ARENA/SET_SCORE';
export const INC_DEATHS = 'ARENA/INC_DEATHS';
export const SET_DEATHS = 'ARENA/SET_DEATHS';
export const MOVE_TO_BIN = 'ARENA/MOVE_TO_BIN';
export const EMPTY_BIN = 'ARENA/EMPTY_BIN';

//// USER SETTINGS ACTIONS

export const SET_PLAYER_MODE = 'USER_SETTINGS/SET_PLAYER_MODE';
export const SET_ARENA_TYPE = 'USER_SETTINGS/SET_ARENA_TYPE';
export const SET_DRAW_GRID = 'USER_SETTINGS/SET_DRAW_GRID';
export const SET_DEATHS_NUM = 'USER_SETTINGS/SET_DEATHS_NUM';

//// INPUT ACTIONS

// export const SET_DIRECTION = 'INPUT/SET_DIRECTION';
export const SET_INPUT = 'INPUT/SET_INPUT';
export const SET_START = 'INPUT/SET_START';
export const SET_RESET = 'INPUT/SET_RESET';

//// SNAKES ACTIONS

export const SET_SNAKE = 'SNAKES/SET_SNAKE';
export const SET_HEAD = 'SNAKES/SET_HEAD';
export const SET_TAIL = 'SNAKES/SET_TAIL';
export const SEND_DIRECTION = 'SNAKES/SEND_DIRECTION';

//// BULLETS ACTIONS

export const SET_BULLET = 'BULLETS/SET_BULLET';
export const REMOVE_BULLET = 'BULLETS/REMOVE_BULLET';
export const RESET_BULLETS = 'BULLETS/RESET_BULLETS';
