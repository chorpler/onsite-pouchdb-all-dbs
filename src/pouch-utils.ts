// import cloneBuffer from 'clone-buffer';
import * as inherits from 'inherits';

// import * as utils from 'pouchdb-utils';
// function isBinaryObject(object) {
//   return object instanceof Buffer;
// }

// most of this is borrowed from lodash.isPlainObject:
// https://github.com/fis-components/lodash.isplainobject/
// blob/29c358140a74f252aeb08c9eb28bef86f2217d4a/index.js

// const funcToString = Function.prototype.toString;
// const objectCtorString = funcToString.call(Object);

// function isPlainObject(value) {
//   const proto = Object.getPrototypeOf(value);
//   /* istanbul ignore if */
//   if (proto === null) { // not sure when this happens, but I guess it can
//     return true;
//   }
//   const Ctor = proto.constructor;
//   return (typeof Ctor == 'function' &&
//     Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
// }

// function clone(object) {
//   let newObject;
//   let i;
//   let len;

//   if (!object || typeof object !== 'object') {
//     return object;
//   }

//   if (Array.isArray(object)) {
//     newObject = [];
//     for (i = 0, len = object.length; i < len; i++) {
//       newObject[i] = clone(object[i]);
//     }
//     return newObject;
//   }

//   // special case: to avoid inconsistencies between IndexedDB
//   // and other backends, we automatically stringify Dates
//   if (object instanceof Date && isFinite((object as any))) {
//     return object.toISOString();
//   }

//   if (isBinaryObject(object)) {
//     return cloneBuffer(object);
//   }

//   if (!isPlainObject(object)) {
//     return object; // don't clone objects like Workers
//   }

//   newObject = {};
//   for (i in object) {
//     /* istanbul ignore else */
//     if (Object.prototype.hasOwnProperty.call(object, i)) {
//       let value = clone(object[i]);
//       if (typeof value !== 'undefined') {
//         newObject[i] = value;
//       }
//     }
//   }
//   return newObject;
// }


/* istanbul ignore next */
const once = function(fun:any) {
  let called = false;
  return getArguments(function(args) {
    if(called) {
      console.trace();
      throw new Error('once called more than once');
    } else {
      called = true;
      fun.apply(this, args);
    }
  });
};

/* istanbul ignore next */
const getArguments = function(fun:any) {
  const self = this;
  return function(...params:any[]) {
    const len = params.length;
    const args = new Array(len);
    let i = -1;
    while(++i < len) {
      args[i] = params[i];
    }
    return fun.call(self, args);
  };
};

// const toPromise = function(func) {
//   //create the function we will be returning
//   return getArguments(function (args) {
//     // Clone arguments
//     args = clone(args);
//     let self = this;
//     // if the last argument is a function, assume its a callback
//     let usedCB = (typeof args[args.length - 1] === 'function') ? args.pop() : false;
//     let promise = new Promise(function (fulfill, reject) {
//       let resp;
//       try {
//         let callback = once(function (err, mesg) {
//           if (err) {
//             reject(err);
//           } else {
//             fulfill(mesg);
//           }
//         });
//         // create a callback for this invocation
//         // apply the function in the orig context
//         args.push(callback);
//         resp = func.apply(self, args);
//         if (resp && typeof resp.then === 'function') {
//           fulfill(resp);
//         }
//       } catch (e) {
//         reject(e);
//       }
//     });
//     // if there is a callback, call it back
//     if (usedCB) {
//       promise.then(function (result) {
//         usedCB(null, result);
//       }, usedCB);
//     }
//     return promise;
//   });
// };

/* istanbul ignore next */
// const toPromise2 = function(callback:Function) {
//   //create the function we will be returning
//   return exports.getArguments(function (args) {
//     let self = this;
//     let tempCB = (typeof args[args.length - 1] === 'function') ? args.pop() : false;
//     // if the last argument is a function, assume its a callback
//     let usedCB;
//     if (tempCB) {
//       // if it was a callback, create a new callback which calls it,
//       // but do so async so we don't trap any errors
//       usedCB = function (err, resp) {
//         process.nextTick(function () {
//           tempCB(err, resp);
//         });
//       };
//     }
//     let promise = new Promise(function (fulfill, reject) {
//       try {
//         let callback = exports.once(function (err, mesg) {
//           if (err) {
//             reject(err);
//           } else {
//             fulfill(mesg);
//           }
//         });
//         // create a callback for this invocation
//         // apply the function in the orig context
//         args.push(callback);
//         callback.apply(self, args);
//       } catch (e) {
//         reject(e);
//       }
//     });
//     // if there is a callback, call it back
//     if(usedCB) {
//       promise.then(function (result) {
//         usedCB(null, result);
//       }, usedCB);
//     }
//     // promise.cancel = function () {
//     //   return this;
//     // };
//     return promise;
//   });
// };
// exports.inherits = require('inherits');

// export { once, getArguments, toPromise, inherits };
export { once, getArguments, inherits };


