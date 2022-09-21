"use strict";
// var utils = require('./pouch-utils');
// var TaskQueue = require('./taskqueue');
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// import PouchDB from 'pouchdb-core';
// import * as utils from 'pouchdb-utils';
var taskqueue_1 = require("./taskqueue");
// const allDbsPlugin = function(pouchdb:typeof PouchDB) {
var allDbsPlugin = function (pouchdb) {
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
    var Pouch = PouchDB;
    var adapter = Pouch && Array.isArray(Pouch.preferredAdapters) && Pouch.preferredAdapters.length > 0 ? Pouch.preferredAdapters[0] : null;
    var defaultOpts = {};
    if (adapter) {
        defaultOpts.adapter = adapter;
    }
    var ALL_DBS_NAME = 'pouch__all_dbs__';
    var AllDbsDatabase;
    var cache;
    var queue = new taskqueue_1.TaskQueue();
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
            }
            else {
                AllDbsDatabase = new Pouch(ALL_DBS_NAME, defaultOpts);
                callback();
            }
        });
    }
    function normalize(name) {
        return name.replace(/^_pouch_/, ''); // TODO: remove when fixed in Pouch
    }
    function canIgnore(dbName) {
        return (dbName === ALL_DBS_NAME) ||
            // TODO: get rid of this when we have a real 'onDependentDbRegistered'
            // event (pouchdb/pouchdb#2438)
            (dbName.indexOf('-mrview-') !== -1) ||
            // TODO: might be a better way to detect remote DBs
            (/^https?:\/\//.test(dbName));
    }
    Pouch.on('created', function (dbName) {
        dbName = normalize(dbName);
        if (canIgnore(dbName)) {
            return;
        }
        dbName = prefixed(dbName);
        init();
        queue.add(function (callback) {
            AllDbsDatabase.get(dbName).then(function () {
                // db exists, nothing to do
            }).catch(function (err) {
                /* istanbul ignore if */
                if (err.name !== 'not_found') {
                    throw err;
                }
                return AllDbsDatabase.put({ _id: dbName });
            }).then(function () {
                if (cache) {
                    cache[dbName] = true;
                }
                callback();
                // }, callback);
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
            }).catch(function (err) {
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
    });
    // const emptyFunc = () => {};
    var allDbs = function () { return __awaiter(_this, void 0, void 0, function () {
        var opts, dbs_1, res, rows, err2_1, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    init();
                    opts = { startkey: PREFIX, endkey: (PREFIX + '\uffff') };
                    cache = {};
                    dbs_1 = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, AllDbsDatabase.allDocs(opts)];
                case 2:
                    res = _a.sent();
                    rows = res && res.rows && Array.isArray(res.rows) ? res.rows : [];
                    rows.forEach(function (row) {
                        dbs_1.push(unprefixed(row.key));
                        cache[row.key] = true;
                    });
                    return [2 /*return*/, dbs_1];
                case 3:
                    err2_1 = _a.sent();
                    console.error(err2_1);
                    throw err2_1;
                case 4: return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    console.error(err_1);
                    throw err_1;
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var resetAllDbs = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, AllDbsDatabase.destroy()];
                case 1:
                    _a.sent();
                    AllDbsDatabase = null;
                    cache = null;
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    console.error(err_2);
                    throw err_2;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // const allDbs = toPromise(function(callback:Function) {
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
    pouchdb.resetAllDbs = resetAllDbs;
    // };
};
/* istanbul ignore next */
// if(typeof window !== 'undefined' && (window as any).PouchDB) {
//   module.exports((window as any).PouchDB);
// }
var plugin = {
    pluginType: 'function',
    pluginName: 'allDbs',
    pluginFunction: allDbsPlugin,
};
exports.default = plugin;
//# sourceMappingURL=index.js.map