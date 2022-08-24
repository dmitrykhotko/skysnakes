import { Direction, SnakeState } from "../snake/snake"

export interface Presenter {
	draw(state: SnakeState): void
	setServiceInfoFlag(flag: boolean): void
	onInput(cb: (input: Direction) => void): void
}
