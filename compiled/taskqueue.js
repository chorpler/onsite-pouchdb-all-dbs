"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskQueue = void 0;
var argsarray_1 = __importDefault(require("argsarray"));
var tiny_queue_1 = __importDefault(require("tiny-queue"));
// see http://stackoverflow.com/a/15349865/680742
/* istanbul ignore next */
var nextTick = global.setImmediate || process.nextTick;
// eslint-disable-next-line @typescript-eslint/no-empty-function
var emptyFunc = function () { };
var TaskQueue = /** @class */ (function () {
    function TaskQueue() {
        this.queue = new tiny_queue_1.default();
        this.running = false;
        // Constructor is here, but does nothing special
    }
    TaskQueue.prototype.processNext = function () {
        var self = this;
        if (self.running || !(self && self.queue && self.queue.length)) {
            return;
        }
        self.running = true;
        var task = self.queue.shift();
        nextTick(function () {
            task.fun(argsarray_1.default(function (args) {
                var _a;
                (_a = task.callback).apply.apply(_a, __spread([null], args));
                self.running = false;
                self.processNext();
            }));
        });
    };
    TaskQueue.prototype.add = function (fun, callback) {
        var cb = callback;
        if (callback === null || typeof callback !== 'function') {
            cb = emptyFunc;
        }
        this.queue.push({ fun: fun, callback: cb });
        this.processNext();
    };
    return TaskQueue;
}());
exports.TaskQueue = TaskQueue;
//# sourceMappingURL=taskqueue.js.map