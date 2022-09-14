import { ArenaType, PlayerMode } from "./enums"

export type Point = {
	x: number,
	y: number,
	next?: Point,
	prev?: Point
}

export type UserSettings = {
	playerMode: PlayerMode,
	arenaType: ArenaType
}
