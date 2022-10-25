import { Hlp } from './hlp';
import { Id } from './types';

export type Task = (...params: unknown[]) => unknown;

export type DelayedTask = {
	delay: number;
	task: Task;
	id: Id;
};

export abstract class DelayedTasks {
	private static delayedTasks = [] as DelayedTask[];

	static delay = (task: Task, delay: number): Id => {
		const id = Hlp.generateId();

		this.delayedTasks.push({
			id,
			delay,
			task
		});

		return id;
	};

	static run = (): void => {
		const delayedTasks = [] as DelayedTask[];

		for (let i = 0; i < this.delayedTasks.length; i++) {
			const item = this.delayedTasks[i];
			item.delay-- ? delayedTasks.push(item) : item.task();
		}

		this.delayedTasks = delayedTasks;
	};

	static remove = (id: Id): void => {
		this.delayedTasks = Hlp.filterById(id, this.delayedTasks);
	};
}
