import { Action } from '../../actions/action';
import { SetValueAction } from '../../actions/actionsCreators/setActions';

const defaultPredicate = (oldProp: unknown, newProp: unknown): boolean => oldProp !== newProp;

export const compareProps = <T = unknown>(
	oldVal: Record<string, unknown> | undefined,
	newVal: Record<string, unknown>,
	pName: string,
	cb: (propVal: T) => unknown,
	predicate = defaultPredicate
): unknown => {
	return predicate(oldVal ? oldVal[pName] : undefined, newVal[pName]) ? cb(newVal[pName] as T) : undefined;
};

export const buildState = <T>(state: T, action: Action, sectionName: string, pName: string): T => ({
	...state,
	[sectionName]: {
		...state[sectionName as keyof T],
		...{
			[pName]: (action as SetValueAction<unknown>).value
		}
	}
});
