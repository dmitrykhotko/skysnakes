import { Direction, SnakeState } from "../snake/snake"

export interface Renderer {
	render(state: SnakeState): void
	onInput(cb: (input: Direction) => void): void
}
