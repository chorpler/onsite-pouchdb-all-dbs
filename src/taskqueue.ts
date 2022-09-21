import argsarray from 'argsarray';
import Queue from 'tiny-queue';

// see http://stackoverflow.com/a/15349865/680742
/* istanbul ignore next */
const nextTick = global.setImmediate || process.nextTick;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const emptyFunc = () => {};

class TaskQueue {
  public queue = new Queue();
  public running = false;
  constructor() {
    // Constructor is here, but does nothing special
  }

  public processNext() {
    const self = this;
    if(self.running || !(self && self.queue && self.queue.length)) {
      return;
    }
    self.running = true;
  
    const task = self.queue.shift();
    nextTick(() => {
      task.fun(argsarray((args) => {
        task.callback.apply(null, ...args);
        self.running = false;
        self.processNext();
      }));
    });
  }

  public add(fun:any, callback?:any) {
    let cb = callback;
    if(callback === null || typeof callback !== 'function') {
      cb = emptyFunc;
    }
    this.queue.push({ fun: fun, callback: cb });
    this.processNext();
  }
}

export { TaskQueue };
