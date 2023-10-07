import { Id } from '../../common/types';
import { Hlp } from './hlp';

export type Task = (...params: unknown[]) => void;

type DelayedTask = {
    task: Task;
    id: Id;
    params?: unknown[];
};

export abstract class DelayedTasks {
    private static tasks = {} as Record<number, DelayedTask[]>;
    private static step = 0;

    static delay = (task: Task, delay: number, ...params: unknown[]): Id => {
        const id = Hlp.id();
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
                const { task, params = [] } = tasks[i];
                task(...params);
            }

            delete this.tasks[this.step];
        }

        this.step++;
    };

    static reset = (): void => {
        this.tasks = {};
        this.step = 0;
    };
}
