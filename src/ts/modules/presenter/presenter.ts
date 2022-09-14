import { Input } from "../../utils/enums"
import { FieldState } from "../field/field";

export abstract class Presenter {
	abstract input(input: Input): void;

	abstract onInput(cb: (input: Input) => void): void;

	abstract render(states: FieldState): void;

	abstract reset(): void;
}
