import { Action } from "./actions";
import { Executor } from "./Executor";

const ACTION_LIMIT = 100;
const ACTION_TRIGGER_TIMEOUT = 5000;

export class Scheduler {
    private actions: Action[] = [];
    private timeout: any = undefined;

    constructor(private executor: Executor) {}

    schedule(action: Action) {
        if (this.timeout !== undefined) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        this.actions.push(action);
        if (this.actions.length >= ACTION_LIMIT) {
            this.trigger();
        } else {
            this.timeout = setTimeout(() => this.trigger(), ACTION_TRIGGER_TIMEOUT);
        }
    }

    trigger() {
        this.executor.execute(this.actions);
        this.actions = [];
    }
}
