import { Action } from '../../actions/action';
import { SetValueAction } from '../../actions/actionsCreators/setActions';

export const setValue = <T, K>(state: T, action: Action, sectionName: keyof T, pName: keyof K): T => ({
	...state,
	[sectionName]: {
		...state[sectionName],
		...{
			[pName]: (action as SetValueAction<unknown>).value
		}
	}
});
