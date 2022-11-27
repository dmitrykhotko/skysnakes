// DEV SETTINGS

export const TRACE_STATE = false;

// GAME DEFAULTS

export const SNAKE_LENGTH = 2;

export const FPS = 30; // Valid values are 60, 30, 20,15,10...
export const SNAKE_SPEED = 1;
export const BULLET_THROTTLE_DELAY = 500;
export const BULLET_SPEED = 2;
export const GAME_START_DELAY = 3000;
export const COINS_DENSITY = 0.003;

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
