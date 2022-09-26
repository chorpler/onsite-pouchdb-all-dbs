(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PouchAllDbsPlugin = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process,global){(function (){
'use strict';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
  return module = {
    exports: {}
  }, fn(module, module.exports), module.exports;
}

var argsarray = argsArray;

function argsArray(fun) {
  return function () {
    var arguments$1 = arguments;
    var len = arguments.length;

    if (len) {
      var args = [];
      var i = -1;

      while (++i < len) {
        args[i] = arguments$1[i];
      }

      return fun.call(this, args);
    } else {
      return fun.call(this, []);
    }
  };
} // Simple FIFO queue implementation to avoid having to do shift()
// on an array, which is slow.


function Queue() {
  this.length = 0;
}

Queue.prototype.push = function (item) {
  var node = {
    item: item
  };

  if (this.last) {
    this.last = this.last.next = node;
  } else {
    this.last = this.first = node;
  }

  this.length++;
};

Queue.prototype.shift = function () {
  var node = this.first;

  if (node) {
    this.first = node.next;

    if (! --this.length) {
      this.last = undefined;
    }

    return node.item;
  }
};

Queue.prototype.slice = function (start, end) {
  start = typeof start === 'undefined' ? 0 : start;
  end = typeof end === 'undefined' ? Infinity : end;
  var output = [];
  var i = 0;

  for (var node = this.first; node; node = node.next) {
    if (--end < 0) {
      break;
    } else if (++i > start) {
      output.push(node.item);
    }
  }

  return output;
};

var tinyQueue = Queue;
var taskqueue = createCommonjsModule(function (module, exports) {
  var __read = commonjsGlobal && commonjsGlobal.__read || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];

    if (!m) {
      return o;
    }

    var i = m.call(o),
        r,
        ar = [],
        e;

    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) {
        ar.push(r.value);
      }
    } catch (error) {
      e = {
        error: error
      };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) {
          m.call(i);
        }
      } finally {
        if (e) {
          throw e.error;
        }
      }
    }

    return ar;
  };

  var __spread = commonjsGlobal && commonjsGlobal.__spread || function () {
    var arguments$1 = arguments;

    for (var ar = [], i = 0; i < arguments.length; i++) {
      ar = ar.concat(__read(arguments$1[i]));
    }

    return ar;
  };

  var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : {
      "default": mod
    };
  };

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.TaskQueue = void 0;

  var argsarray_1 = __importDefault(argsarray);

  var tiny_queue_1 = __importDefault(tinyQueue); // see http://stackoverflow.com/a/15349865/680742

  /* istanbul ignore next */


  var nextTick = commonjsGlobal.setImmediate || process.nextTick; // eslint-disable-next-line @typescript-eslint/no-empty-function

  var emptyFunc = function emptyFunc() {};

  var TaskQueue =
  /** @class */
  function () {
    function TaskQueue() {
      this.queue = new tiny_queue_1["default"]();
      this.running = false; // Constructor is here, but does nothing special
    }

    TaskQueue.prototype.processNext = function () {
      var self = this;

      if (self.running || !(self && self.queue && self.queue.length)) {
        return;
      }

      self.running = true;
      var task = self.queue.shift();
      nextTick(function () {
        task.fun(argsarray_1["default"](function (args) {
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

      this.queue.push({
        fun: fun,
        callback: cb
      });
      this.processNext();
    };

    return TaskQueue;
  }();

  exports.TaskQueue = TaskQueue;
});
unwrapExports(taskqueue);
var taskqueue_1 = taskqueue.TaskQueue;
var compiled = createCommonjsModule(function (module, exports) {
  // var utils = require('./pouch-utils');
  // var TaskQueue = require('./taskqueue');
  var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function (resolve) {
        resolve(value);
      });
    }

    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }

      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }

      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }

      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };

  var __generator = commonjsGlobal && commonjsGlobal.__generator || function (thisArg, body) {
    var _ = {
      label: 0,
      sent: function sent() {
        if (t[0] & 1) {
          throw t[1];
        }

        return t[1];
      },
      trys: [],
      ops: []
    },
        f,
        y,
        t,
        g;
    return g = {
      next: verb(0),
      "throw": verb(1),
      "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
      return this;
    }), g;

    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }

    function step(op) {
      if (f) {
        throw new TypeError("Generator is already executing.");
      }

      while (_) {
        try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) {
            return t;
          }

          if (y = 0, t) {
            op = [op[0] & 2, t.value];
          }

          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;

            case 4:
              _.label++;
              return {
                value: op[1],
                done: false
              };

            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;

            case 7:
              op = _.ops.pop();

              _.trys.pop();

              continue;

            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }

              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break;
              }

              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }

              if (t && _.label < t[2]) {
                _.label = t[2];

                _.ops.push(op);

                break;
              }

              if (t[2]) {
                _.ops.pop();
              }

              _.trys.pop();

              continue;
          }

          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      }

      if (op[0] & 5) {
        throw op[1];
      }

      return {
        value: op[0] ? op[1] : void 0,
        done: true
      };
    }
  };

  Object.defineProperty(exports, "__esModule", {
    value: true
  }); // import PouchDB from 'pouchdb-core';
  // import * as utils from 'pouchdb-utils';
  // const allDbsPlugin = function(pouchdb:typeof PouchDB) {

  var allDbsPlugin = function allDbsPlugin(pouchdb) {
    // type Database = PouchDB.Database<any>;
    // console.log(`allDbsPlugin(): Called with parameters:\n`, pouchdb);
    var _this = this;

    var PREFIX = "db_";
    var PouchDB = pouchdb;
    /**
    * Given a PouchDB database name, returns the name with the prefix attached.
    *
    * @param {string} dbName A valid PouchDB database name.
    * @returns {string} PouchDB database name with the global prefix attached.
    */

    function prefixed(dbName) {
      //A database name starting with an underscore is valid, but a document
      //id starting with an underscore is not in most cases. Because of
      //that, they're prefixed in the all dbs database. See issue #7 for
      //more info.
      return PREFIX + dbName;
    }
    /**
    * Return the database name with prefix stripped away.
    *
    * @param {string} dbName Prefixed PouchDB database name.
    * @returns {string} PouchDB database name with prefix stripped away
    */


    function unprefixed(dbName) {
      var out = dbName;

      if (typeof dbName === 'string' && dbName.startsWith(PREFIX)) {
        out = dbName.slice(PREFIX.length);
      }

      return out;
    }

    var Pouch = PouchDB; // eslint-disable-next-line prefer-const

    var adapter = Pouch && Array.isArray(Pouch.preferredAdapters) && Pouch.preferredAdapters.indexOf('indexeddb') > -1 ? 'indexeddb' : Pouch.preferredAdapters.indexOf('idb') > -1 ? 'idb' : Pouch.preferredAdapters.length > 0 ? Pouch.preferredAdapters[0] : null;
    var defaultOpts = {};

    if (adapter) {
      defaultOpts.adapter = adapter;
    }

    var ALL_DBS_NAME = 'pouch__all_dbs__';
    var AllDbsDatabase;
    var cache;
    var queue = new taskqueue.TaskQueue();

    function log(err) {
      /* istanbul ignore if */
      if (err) {
        console.error(err); // shouldn't happen
      }
    }

    function init() {
      queue.add(function (callback) {
        if (AllDbsDatabase) {
          return callback();
        } else {
          AllDbsDatabase = new Pouch(ALL_DBS_NAME, defaultOpts);
          callback();
        }
      });
    }

    function normalize(name) {
      return name.replace(/^_pouch_/, ''); // TODO: remove when fixed in Pouch
    }

    function canIgnore(dbName) {
      return dbName === ALL_DBS_NAME || // TODO: get rid of this when we have a real 'onDependentDbRegistered'
      // event (pouchdb/pouchdb#2438)
      dbName.indexOf('-mrview-') !== -1 || // TODO: might be a better way to detect remote DBs
      /^https?:\/\//.test(dbName);
    }

    Pouch.on('created', function (dbName) {
      dbName = normalize(dbName);

      if (canIgnore(dbName)) {
        return;
      }

      dbName = prefixed(dbName);
      init();
      queue.add(function (callback) {
        AllDbsDatabase.get(dbName).then(function () {// db exists, nothing to do
        })["catch"](function (err) {
          /* istanbul ignore if */
          if (err.name !== 'not_found') {
            throw err;
          }

          return AllDbsDatabase.put({
            _id: dbName
          });
        }).then(function () {
          if (cache) {
            cache[dbName] = true;
          }

          callback(); // }, callback);
        });
      }, log);
    });
    Pouch.on('destroyed', function (dbName) {
      dbName = normalize(dbName);

      if (canIgnore(dbName)) {
        return;
      }

      dbName = prefixed(dbName);
      init();
      queue.add(function (callback) {
        AllDbsDatabase.get(dbName).then(function (doc) {
          return AllDbsDatabase.remove(doc);
        })["catch"](function (err) {
          // normally a not_found error; nothing to do
          if (err.name !== 'not_found') {
            throw err;
          }
        }).then(function () {
          /* istanbul ignore else */
          if (cache) {
            delete cache[dbName];
          }

          callback();
        }, callback);
      }, log);
    }); // const emptyFunc = () => {};

    var allDbs = function allDbs() {
      return __awaiter(_this, void 0, void 0, function () {
        var allDocsOpts, dbs_1, res, rows, err2_1, err_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 5,, 6]);

              init();
              allDocsOpts = {
                startkey: PREFIX,
                endkey: PREFIX + "\uFFFF"
              };
              cache = {};
              dbs_1 = [];
              _a.label = 1;

            case 1:
              _a.trys.push([1, 3,, 4]);

              return [4
              /*yield*/
              , AllDbsDatabase.allDocs(allDocsOpts)];

            case 2:
              res = _a.sent();
              rows = res && res.rows && Array.isArray(res.rows) ? res.rows : [];
              rows.forEach(function (row) {
                dbs_1.push(unprefixed(row.key));
                cache[row.key] = true;
              });
              return [2
              /*return*/
              , dbs_1];

            case 3:
              err2_1 = _a.sent();
              console.error(err2_1);
              throw err2_1;

            case 4:
              return [3
              /*break*/
              , 6];

            case 5:
              err_1 = _a.sent();
              console.error(err_1);
              throw err_1;

            case 6:
              return [2
              /*return*/
              ];
          }
        });
      });
    };

    var resetAllDbs = function resetAllDbs() {
      return __awaiter(_this, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2,, 3]);

              return [4
              /*yield*/
              , AllDbsDatabase.destroy()];

            case 1:
              _a.sent();

              AllDbsDatabase = null;
              cache = null;
              return [3
              /*break*/
              , 3];

            case 2:
              err_2 = _a.sent();
              console.error(err_2);
              throw err_2;

            case 3:
              return [2
              /*return*/
              ];
          }
        });
      });
    }; // const allDbs = toPromise(function(callback:Function) {
    //   init();
    //   queue.add(function(callback2:Function) {
    //     if(cache) {
    //       return callback2(null, Object.keys(cache).map(unprefixed));
    //     }
    //     // older versions of this module didn't have prefixes, so check here
    //     let opts = {startkey: PREFIX, endkey: (PREFIX + '\uffff')};
    //     pouch.allDocs(opts).then(function(res:PouchDB.Core.AllDocsResponse<any>) {
    //       cache = {};
    //       let dbs:string[] = [];
    //       res.rows.forEach(function(row) {
    //         dbs.push(unprefixed(row.key));
    //         cache[row.key] = true;
    //       });
    //       callback2(null, dbs);
    //     }).catch(/* istanbul ignore next */ function (err) {
    //       console.error(err);
    //       callback2(err);
    //     });
    //   }, callback);
    // });
    // const resetAllDbs = async function(function(callback:Function) {
    //   queue.add(function(callback2:Function) {
    //     pouch.destroy().then(function () {
    //       pouch = null;
    //       cache = null;
    //       callback2();
    //     }).catch(/* istanbul ignore next */ function(err) {
    //       console.error(err);
    //       callback2(err);
    //     });
    //   }, callback);
    // });


    pouchdb.allDbs = allDbs;
    pouchdb.resetAllDbs = resetAllDbs; // };
  };
  /* istanbul ignore next */
  // if(typeof window !== 'undefined' && (window as any).PouchDB) {
  //   module.exports((window as any).PouchDB);
  // }


  var plugin = {
    pluginType: 'function',
    pluginName: 'allDbs',
    pluginFunction: allDbsPlugin
  };
  exports["default"] = plugin;
});
var index = unwrapExports(compiled);
module.exports = index;

}).call(this)}).call(this,require(2),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"2":2}],2:[function(require,module,exports){
"use strict";

// shim for using process in browser
var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

(function () {
  try {
    if (typeof setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }

  try {
    if (typeof clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}; // v8 likes predictible objects


function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
  return [];
};

process.binding = function (name) {
  throw new Error('process.binding is not supported');
};

process.cwd = function () {
  return '/';
};

process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};

process.umask = function () {
  return 0;
};

},{}]},{},[1])(1)
});
