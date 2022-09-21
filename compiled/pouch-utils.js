"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inherits = exports.getArguments = exports.once = void 0;
// import cloneBuffer from 'clone-buffer';
var inherits = __importStar(require("inherits"));
exports.inherits = inherits;
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
var once = function (fun) {
    var called = false;
    return getArguments(function (args) {
        if (called) {
            console.trace();
            throw new Error('once called more than once');
        }
        else {
            called = true;
            fun.apply(this, args);
        }
    });
};
exports.once = once;
/* istanbul ignore next */
var getArguments = function (fun) {
    var self = this;
    return function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        var len = params.length;
        var args = new Array(len);
        var i = -1;
        while (++i < len) {
            args[i] = params[i];
        }
        return fun.call(self, args);
    };
};
exports.getArguments = getArguments;
//# sourceMappingURL=pouch-utils.js.map