export type Task = (...params: unknown[]) => unknown;

export type DelayedTask = {
	delay: number;
	task: Task;
};

export abstract class DelayedTasks {
	private static delayedTasks = [] as DelayedTask[];

	static delay = (task: Task, delay: number): void => {
		this.delayedTasks.push({
			delay,
			task
		});
	};

	static run = (): void => {
		const delayedTasks = [] as DelayedTask[];

		for (let i = 0; i < this.delayedTasks.length; i++) {
			const item = this.delayedTasks[i];
			--item.delay ? delayedTasks.push(item) : item.task();
		}

		this.delayedTasks = delayedTasks;
	};
}
