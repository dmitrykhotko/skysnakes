import { Hlp } from './hlp';
import { Id } from './types';

export type Task = (id: Id, ...params: unknown[]) => void;

type DelayedTask = {
	task: Task;
	id: Id;
	params?: unknown[];
};

export abstract class DelayedTasks {
	private static tasks = {} as Record<number, DelayedTask[]>;
	private static rmSet = new Set<Id>();
	private static step = 0;

	static delay = (task: Task, delay: number, ...params: unknown[]): Id => {
		const id = Hlp.generateId();
		const step = this.step + delay;

		if (!this.tasks[step]) {
			this.tasks[step] = [];
		}

		this.tasks[step].push({
			id,
			task,
			params
		});

		return id;
	};

	static run = (): void => {
		const tasks = this.tasks[this.step];

		if (tasks) {
			for (let i = 0; i < tasks.length; i++) {
				const { task, id, params = [] } = tasks[i];

				if (this.rmSet.has(id)) {
					this.rmSet.delete(id);
					continue;
				}

				task(id, ...params);
			}

			delete this.tasks[this.step];
		}

		this.step++;
	};

	static remove = (id: Id): void => {
		this.rmSet.add(id);
	};
}
