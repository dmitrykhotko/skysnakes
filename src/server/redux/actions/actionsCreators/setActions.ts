import { Action } from '../action';
import { ActionType } from '../actionType';

export interface SetValueAction<T> extends Action {
    value: T;
}

export interface SetValueByIdAction<T, K> extends SetValueAction<T> {
    id: K;
}

export abstract class SetActions {
    static set =
        (type: ActionType): (() => Action) =>
        (): { type: ActionType } => ({
            type
        });

    static setValue =
        <T>(type: ActionType): ((value: T) => SetValueAction<T>) =>
        (value: T): SetValueAction<T> => ({
            type,
            value
        });

    static setStaticValue =
        <T>(type: ActionType, value: T): (() => SetValueAction<T>) =>
        (): SetValueAction<T> => ({
            type,
            value
        });

    static setValueById =
        <T, K>(type: ActionType): ((value: T, id: K) => SetValueByIdAction<T, K>) =>
        (value: T, id: K): SetValueByIdAction<T, K> => ({
            type,
            value,
            id
        });
}
