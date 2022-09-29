export { Store, state } from './state';

export { Reducer } from './reducers/reducer';
export { SettingsReducer, SettingsStore } from './reducers/instances/settings';
export { ArenaReducer, ArenaStore } from './reducers/instances/arena';
export { InputReducer, InputStore } from './reducers/instances/input';
export { SnakesReducer, SnakesStore } from './reducers/instances/snakes';
export { ReducerCollection } from './reducers/reducerCollection';

export { Action } from './actions/action';
export { SetValueAction, SetActions, SetValueByIdAction } from './actions/actionsCreators/setActions';
export { ArenaActions } from './actions/actionsCreators/arenaActions';
export { InputActions } from './actions/actionsCreators/inputActions';
export { SnakesActions } from './actions/actionsCreators/snakesActions';

export { compareProps } from './reducers/utils';
