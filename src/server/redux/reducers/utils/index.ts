import { Action } from '../../actions/action';
import { SetValueAction } from '../../actions/actionsCreators/setActions';

export const setValue = <T>(state: T, action: Action, sectionName: keyof T, pName: string): T => ({
    ...state,
    [sectionName]: {
        ...state[sectionName],
        ...{
            [pName]: (action as SetValueAction<unknown>).value
        }
    }
});
