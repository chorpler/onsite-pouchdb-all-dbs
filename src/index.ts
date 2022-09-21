// var utils = require('./pouch-utils');
// var TaskQueue = require('./taskqueue');

// import PouchDB from 'pouchdb-core';
// import * as utils from 'pouchdb-utils';
import { TaskQueue } from './taskqueue';

// const allDbsPlugin = function(pouchdb:typeof PouchDB) {
const allDbsPlugin = function(pouchdb:any) {
  // type Database = PouchDB.Database<any>;
  // console.log(`allDbsPlugin(): Called with parameters:\n`, pouchdb);

  const PREFIX = "db_";
  const PouchDB = pouchdb;

  /**
  * Given a PouchDB database name, returns the name with the prefix attached.
  *
  * @param {string} dbName A valid PouchDB database name.
  * @returns {string} PouchDB database name with the global prefix attached.
  */
  function prefixed(dbName:string):string {
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
  function unprefixed(dbName:string):string {
    let out = dbName;
    if(typeof dbName === 'string' && dbName.startsWith(PREFIX)) {
      out = dbName.slice(PREFIX.length);
    }
    return out;
  }

  const Pouch = PouchDB;
  const adapter = Pouch && Array.isArray(Pouch.preferredAdapters) && Pouch.preferredAdapters.length > 0 ? Pouch.preferredAdapters[0] : null;
  const defaultOpts:any = {};
  if(adapter) {
    defaultOpts.adapter = adapter;
  }
  const ALL_DBS_NAME = 'pouch__all_dbs__';
  let AllDbsDatabase:PouchDB.Database;
  let cache:any;
  const queue = new TaskQueue();

  function log(err) {
    /* istanbul ignore if */
    if(err) {
      console.error(err); // shouldn't happen
    }
  }
  
  function init() {
    queue.add(function(callback:any) {
      if(AllDbsDatabase) {
        return callback();
      } else {
        AllDbsDatabase = new Pouch(ALL_DBS_NAME, defaultOpts);
        callback();
      }
    });
  }

  function normalize(name:string):string {
    return name.replace(/^_pouch_/, ''); // TODO: remove when fixed in Pouch
  }

  function canIgnore(dbName:string):boolean {
    return (dbName === ALL_DBS_NAME) ||
      // TODO: get rid of this when we have a real 'onDependentDbRegistered'
      // event (pouchdb/pouchdb#2438)
      (dbName.indexOf('-mrview-') !== -1) ||
      // TODO: might be a better way to detect remote DBs
      (/^https?:\/\//.test(dbName));
  }

  Pouch.on('created', (dbName:string) => {
    dbName = normalize(dbName);
    if(canIgnore(dbName)) {
      return;
    }
    dbName = prefixed(dbName);
    init();
    queue.add((callback:any) => {
      AllDbsDatabase.get(dbName).then(() => {
        // db exists, nothing to do
      }).catch((err) => {
        /* istanbul ignore if */
        if(err.name !== 'not_found') {
          throw err;
        }
        return AllDbsDatabase.put({_id: dbName});
      }).then(() => {
        if(cache) {
          cache[dbName] = true;
        }
        callback();
      // }, callback);
      });
    }, log);
  });

  Pouch.on('destroyed', (dbName:string) => {
    dbName = normalize(dbName);
    if(canIgnore(dbName)) {
      return;
    }
    dbName = prefixed(dbName);
    init();
    queue.add((callback:any) =>{
      AllDbsDatabase.get(dbName).then((doc:PouchDB.Core.Document<any>) => {
        return AllDbsDatabase.remove(doc);
      }).catch((err) => {
        // normally a not_found error; nothing to do
        if(err.name !== 'not_found') {
          throw err;
        }
      }).then(() => {
        /* istanbul ignore else */
        if(cache) {
          delete cache[dbName];
        }
        callback();
      }, callback);
    }, log);
  });

  // const emptyFunc = () => {};

  const allDbs = async ():Promise<string[]> => {
    try {
      init();
      const opts = { startkey: PREFIX, endkey: (PREFIX + '\uffff')};
      cache = {};
      const dbs:string[] = [];
      try {
        const res = await AllDbsDatabase.allDocs(opts);
        const rows = res && res.rows && Array.isArray(res.rows) ? res.rows : [];
        rows.forEach(row => {
          dbs.push(unprefixed(row.key));
          cache[row.key] = true;
        });
        return dbs;
      } catch (err2) {
        console.error(err2);
        throw err2;
      }
      // queue.add((cb2) => {
      //   if(cache) {
      //     return cb2(null, Object.keys(cache).map(unprefixed));
      //   } else {
      //     let opts = {startkey: PREFIX, endkey: (PREFIX + '\uffff')};
      //     try {
      //       cache = {};
      //       let dbs:string[] = [];
      //       let res = await AllDbsDatabase.allDocs(opts);
      //       res.rows.forEach(function(row) {
      //         dbs.push(unprefixed(row.key));
      //         cache[row.key] = true;
      //       });
      //       cb2(null, dbs);
      //     } catch (err2) {
      //       console.error(err2);
      //       cb2(err2);
      //     }
      //   }
      // }, emptyFunc);
    } catch(err) {
      console.error(err);
      throw err;
    }
  };

  const resetAllDbs = async ():Promise<any> => {
    try {
      await AllDbsDatabase.destroy();
      AllDbsDatabase = null;
      cache = null;
      // queue.add(async (cb) => {
      //   try {
      //     await AllDbsDatabase.destroy();
      //     AllDbsDatabase = null;
      //     cache = null;
      //     cb();
      //   } catch(err2) {
      //     console.error(err2);
      //     cb(err2);
      //   }
      // }, emptyFunc);
    } catch(err) {
      console.error(err);
      throw err;
    }
  };

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

const plugin = {
  pluginType: 'function',
  pluginName: 'allDbs',
  pluginFunction: allDbsPlugin,
};

export default plugin;
