declare class TaskQueue {
    queue: any;
    running: boolean;
    constructor();
    processNext(): void;
    add(fun: any, callback?: any): void;
}
export { TaskQueue };
//# sourceMappingURL=taskqueue.d.ts.map