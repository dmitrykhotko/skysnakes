import { ArenaType, PlayerMode, DrawGrid } from './enums';

export type Point = {
	x: number;
	y: number;
	next?: Point;
	prev?: Point;
};

export type UserSettings = {
	playerMode: PlayerMode;
	arenaType: ArenaType;
	drawGrid: DrawGrid;
	deathsNum: number;
};

export type SnakeState = {
	head: Point;
	tail: Point;
};

export type Score = {
	deaths: number;
	coins: number;
};
