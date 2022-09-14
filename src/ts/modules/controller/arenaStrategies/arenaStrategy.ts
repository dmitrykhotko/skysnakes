import { Field, FieldState } from "../../field/field";

export interface ArenaStrategy {
	apply(field: Field, state: FieldState): void;
}
