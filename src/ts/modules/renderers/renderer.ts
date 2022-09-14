import { FieldState } from "../field/field"
import { ObservableBase } from "../observable/observableBase"

export abstract class Renderer extends ObservableBase {
	abstract render(states: FieldState): void;
	abstract reset(): void;
}
