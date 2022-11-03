// DEV SETTINGS

import { PlayerMode } from './enums';

export const TRACE_STATE = false;

// GAME DEFAULTS

export const CELL_SIZE = 20;
export const LINE_HEIGHT = 30;
export const LIVE_SIZE_CELLS = 4;
export const CIRCLE_RADIUS_CELLS = 0.5;

export const SNAKE_LENGTH = 2;

export const FPS = 30; // Valid values are 60,30,20,15,10...
export const SNAKE_SPEED = 1;
export const BULLET_SPEED = 2;

export const STANDARD_COIN_AWARD = 1;
export const DEATH_ENEMY_COIN_AWARD = STANDARD_COIN_AWARD * 2;
export const DAMAGE_FACTOR = STANDARD_COIN_AWARD * 1.2;
export const HEAD_SHOT_AWARD = STANDARD_COIN_AWARD * 10;
export const KILL_AWARD = STANDARD_COIN_AWARD * 5;

export const RESPAWN_SNAKE_DELAY = 1 * FPS; // X * FPS = Seconds

export const RESPAWN_COIN_MAX_DELAY = 3 * FPS;
export const INIT_COINS_MAX_DELAY = 5 * FPS;
export const STANDARD_COIN_LIFETIME = 90 * FPS;
export const DEATH_COIN_LIFETIME = 180 * FPS;
export const COINS_SPREAD = 5;

export const FACE_COIN_AWARD_LIFETIME = 3 * FPS;
export const POSITIVE_OFFSET_X = 3;
export const NEGATIVE_OFFSET_X = -4;
export const POSITIVE_OFFSET_Y = 4;
export const NEGATIVE_OFFSET_Y = -2;

export const LIVES = 5;
export const COINS_NUMBER = 50;
export const PLAYER_MODE = PlayerMode.Multiplayer;

// ACTIONS

//// COMMON_ACTIONS

export const GAME_RESET = 'COMMON_ACTIONS/GAME_RESET';
export const FOCUS_CHANGED = 'COMMON_ACTIONS/FOCUS_CHANGED';

//// ARENA ACTIONS
export const SET_SIZE = 'ARENA/SET_SIZE';
export const SET_COIN = 'ARENA/SET_COIN';
export const FLUSH_COINS_BUFFER = 'ARENA/FLUSH_COINS_BUFFER';
export const REMOVE_COIN = 'ARENA/REMOVE_COIN';
export const SET_GAME_STATUS = 'ARENA/SET_GAME_STATUS';

//// INPUT ACTIONS

// export const SET_DIRECTION = 'INPUT/SET_DIRECTION';
export const SET_INPUT = 'INPUT/SET_INPUT';

//// SNAKES ACTIONS

export const SET_SNAKE = 'SNAKES/SET_SNAKE';
export const REMOVE_SNAKE = 'SNAKES/REMOVE_SNAKE';
export const SET_HEAD = 'SNAKES/SET_HEAD';
export const SET_TAIL = 'SNAKES/SET_TAIL';
export const NEW_DIRECTION = 'SNAKES/NEW_DIRECTION';

//// BULLETS ACTIONS

export const SET_BULLET = 'BULLETS/SET_BULLET';
export const REMOVE_BULLET = 'BULLETS/REMOVE_BULLET';
export const RESET_BULLETS = 'BULLETS/RESET_BULLETS';

//// BIN ACTIONS

export const MOVE_TO_BIN = 'BIN/MOVE_TO_BIN';
export const EMPTY_BIN = 'BIN/EMPTY_BIN';

//// STAT ACTIONS

export const INC_SCORE = 'STAT/INC_SCORE';
export const CHANGE_SCORE = 'STAT/CHANGE_SCORE';
export const SET_WINNERS = 'STAT/SET_WINNERS';
export const RESET_SCORE = 'STAT/RESET_SCORE';
export const DEC_LIVES = 'STAT/DEC_LIVES';
export const ADD_NOTIFICATION = 'STAT/ADD_NOTIFICATION';
export const REMOVE_NOTIFICATION = 'STAT/REMOVE_NOTIFICATION';
