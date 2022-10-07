export { Store, state } from './state';

export { Reducer } from './reducers/reducer';
export { SettingsReducer, SettingsStore, SettingsState } from './reducers/instances/settings';
export { ArenaReducer, ArenaStore, ArenaState } from './reducers/instances/arena';
export { InputReducer, InputStore, InputState } from './reducers/instances/input';
export { SnakesReducer, SnakesStore, SnakesState } from './reducers/instances/snakes';
export { ShootingReducer, ShootingStore, ShootingState } from './reducers/instances/shooting';
export { ReducerCollection } from './reducers/reducerCollection';

export { Action } from './actions/action';
export { SetValueAction, SetActions, SetValueByIdAction } from './actions/actionsCreators/setActions';
export { ArenaActions } from './actions/actionsCreators/arenaActions';
export { InputActions } from './actions/actionsCreators/inputActions';
export { SnakesActions } from './actions/actionsCreators/snakesActions';
export { ShootingActions } from './actions/actionsCreators/shootingActions';

export { compareProps } from './reducers/utils';
