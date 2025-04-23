import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
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
}

const INSERT = "insert",
  UPDATE = "update",
  DELETE = "delete",
  REVERSE = "reverse",
  SHUFFLE = "shuffle",
  oMetaKey = Symbol.for("object-observer-meta-key-0"),
  validObservableOptionKeys = { async: 1 },
  processObserveOptions = (options) => {
    if (!options || typeof options !== "object") {
      return null;
    }

    const result = {};
    const invalidOptions = [];
    for (const [optName, optVal] of Object.entries(options)) {
      if (optName === "path") {
        if (typeof optVal !== "string" || optVal === "") {
          throw new Error(
            '"path" option, if/when provided, MUST be a non-empty string'
          );
        }
        result[optName] = optVal;
      } else if (optName === "pathsOf") {
        if (options.path) {
          throw new Error(
            '"pathsOf" option MAY NOT be specified together with "path" option'
          );
        }
        if (typeof optVal !== "string") {
          throw new Error(
            '"pathsOf" option, if/when provided, MUST be a string (MAY be empty)'
          );
        }
        result[optName] = options.pathsOf.split(".").filter(Boolean);
      } else if (optName === "pathsFrom") {
        if (options.path || options.pathsOf) {
          throw new Error(
            '"pathsFrom" option MAY NOT be specified together with "path"/"pathsOf" option/s'
          );
        }
        if (typeof optVal !== "string" || optVal === "") {
          throw new Error(
            '"pathsFrom" option, if/when provided, MUST be a non-empty string'
          );
        }
        result[optName] = optVal;
      } else {
        invalidOptions.push(optName);
      }
    }
    if (invalidOptions.length) {
      throw new Error(
        `'${invalidOptions.join(", ")}' is/are not a valid observer option/s`
      );
    }
    return result;
  },
  prepareObject = (source, oMeta) => {
    const target = {};
    target[oMetaKey] = oMeta;
    for (const key in source) {
      target[key] = getObservedOf(source[key], key, oMeta);
    }
    return target;
  },
  prepareArray = (source, oMeta) => {
    let l = source.length;
    const target = new Array(l);
    target[oMetaKey] = oMeta;
    for (let i = 0; i < l; i++) {
      target[i] = getObservedOf(source[i], i, oMeta);
    }
    return target;
  },
  prepareTypedArray = (source, oMeta) => {
    source[oMetaKey] = oMeta;
    return source;
  },
  filterChanges = (options, changes) => {
    if (options === null) {
      return changes;
    }

    let result = changes;
    if (options.path) {
      const oPath = options.path;
      result = changes.filter((change) => change.path.join(".") === oPath);
    } else if (options.pathsOf) {
      const oPathsOf = options.pathsOf;
      const oPathsOfStr = oPathsOf.join(".");
      result = changes.filter(
        (change) =>
          (change.path.length === oPathsOf.length + 1 ||
            (change.path.length === oPathsOf.length &&
              (change.type === REVERSE || change.type === SHUFFLE))) &&
          change.path.join(".").startsWith(oPathsOfStr)
      );
    } else if (options.pathsFrom) {
      const oPathsFrom = options.pathsFrom;
      result = changes.filter((change) =>
        change.path.join(".").startsWith(oPathsFrom)
      );
    }
    return result;
  },
  callObserverSafe = (listener, changes) => {
    try {
      listener(changes);
    } catch (e) {
      console.error(`failed to notify listener ${listener} with ${changes}`, e);
    }
  },
  callObserversFromMT = function callObserversFromMT() {
    const batches = this.batches;
    this.batches = [];
    for (const [listener, changes] of batches) {
      callObserverSafe(listener, changes);
    }
  },
  callObservers = (oMeta, changes) => {
    let currentObservable = oMeta;
    let isAsync, observers, target, options, relevantChanges, i;
    const l = changes.length;
    do {
      isAsync = currentObservable.options.async;
      observers = currentObservable.observers;
      i = observers.length;
      while (i--) {
        [target, options] = observers[i];
        relevantChanges = filterChanges(options, changes);

        if (relevantChanges.length) {
          if (isAsync) {
            //	this is the async dispatch handling
            if (currentObservable.batches.length === 0) {
              queueMicrotask(callObserversFromMT.bind(currentObservable));
            }
            let rb;
            for (const b of currentObservable.batches) {
              if (b[0] === target) {
                rb = b;
                break;
              }
            }
            if (!rb) {
              rb = [target, []];
              currentObservable.batches.push(rb);
            }
            Array.prototype.push.apply(rb[1], relevantChanges);
          } else {
            //	this is the naive straight forward synchronous dispatch
            callObserverSafe(target, relevantChanges);
          }
        }
      }

      //	cloning all the changes and notifying in context of parent
      const parent = currentObservable.parent;
      if (parent) {
        for (let j = 0; j < l; j++) {
          const change = changes[j];
          changes[j] = new Change(
            change.type,
            [currentObservable.ownKey, ...change.path],
            change.value,
            change.oldValue,
            change.object
          );
        }
        currentObservable = parent;
      } else {
        currentObservable = null;
      }
    } while (currentObservable);
  },
  getObservedOf = (item, key, parent) => {
    if (typeof item !== "object" || item === null) {
      return item;
    } else if (Array.isArray(item)) {
      return new ArrayOMeta({ target: item, ownKey: key, parent: parent })
        .proxy;
    } else if (ArrayBuffer.isView(item)) {
      return new TypedArrayOMeta({ target: item, ownKey: key, parent: parent })
        .proxy;
    } else if (item instanceof Date) {
      return item;
    } else {
      return new ObjectOMeta({ target: item, ownKey: key, parent: parent })
        .proxy;
    }
  },
  proxiedPop = function proxiedPop() {
    const oMeta = this[oMetaKey],
      target = oMeta.target,
      poppedIndex = target.length - 1;

    let popResult = target.pop();
    if (popResult && typeof popResult === "object") {
      const tmpObserved = popResult[oMetaKey];
      if (tmpObserved) {
        popResult = tmpObserved.detach();
      }
    }

    const changes = [
      new Change(DELETE, [poppedIndex], undefined, popResult, this),
    ];
    callObservers(oMeta, changes);

    return popResult;
  },
  proxiedPush = function proxiedPush() {
    const oMeta = this[oMetaKey],
      target = oMeta.target,
      l = arguments.length,
      pushContent = new Array(l),
      initialLength = target.length;

    for (let i = 0; i < l; i++) {
      pushContent[i] = getObservedOf(arguments[i], initialLength + i, oMeta);
    }
    const pushResult = Reflect.apply(target.push, target, pushContent);

    const changes = [];
    for (let i = initialLength, j = target.length; i < j; i++) {
      changes[i - initialLength] = new Change(
        INSERT,
        [i],
        target[i],
        undefined,
        this
      );
    }
    callObservers(oMeta, changes);

    return pushResult;
  },
  proxiedShift = function proxiedShift() {
    const oMeta = this[oMetaKey],
      target = oMeta.target;
    let shiftResult, i, l, item, tmpObserved;

    shiftResult = target.shift();
    if (shiftResult && typeof shiftResult === "object") {
      tmpObserved = shiftResult[oMetaKey];
      if (tmpObserved) {
        shiftResult = tmpObserved.detach();
      }
    }

    //	update indices of the remaining items
    for (i = 0, l = target.length; i < l; i++) {
      item = target[i];
      if (item && typeof item === "object") {
        tmpObserved = item[oMetaKey];
        if (tmpObserved) {
          tmpObserved.ownKey = i;
        }
      }
    }

    const changes = [new Change(DELETE, [0], undefined, shiftResult, this)];
    callObservers(oMeta, changes);

    return shiftResult;
  },
  proxiedUnshift = function proxiedUnshift() {
    const oMeta = this[oMetaKey],
      target = oMeta.target,
      al = arguments.length,
      unshiftContent = new Array(al);

    for (let i = 0; i < al; i++) {
      unshiftContent[i] = getObservedOf(arguments[i], i, oMeta);
    }
    const unshiftResult = Reflect.apply(target.unshift, target, unshiftContent);

    for (let i = 0, l = target.length, item; i < l; i++) {
      item = target[i];
      if (item && typeof item === "object") {
        const tmpObserved = item[oMetaKey];
        if (tmpObserved) {
          tmpObserved.ownKey = i;
        }
      }
    }

    //	publish changes
    const l = unshiftContent.length;
    const changes = new Array(l);
    for (let i = 0; i < l; i++) {
      changes[i] = new Change(INSERT, [i], target[i], undefined, this);
    }
    callObservers(oMeta, changes);

    return unshiftResult;
  },
  proxiedReverse = function proxiedReverse() {
    const oMeta = this[oMetaKey],
      target = oMeta.target;
    let i, l, item;

    target.reverse();
    for (i = 0, l = target.length; i < l; i++) {
      item = target[i];
      if (item && typeof item === "object") {
        const tmpObserved = item[oMetaKey];
        if (tmpObserved) {
          tmpObserved.ownKey = i;
        }
      }
    }

    const changes = [new Change(REVERSE, [], undefined, undefined, this)];
    callObservers(oMeta, changes);

    return this;
  },
  proxiedSort = function proxiedSort(comparator) {
    const oMeta = this[oMetaKey],
      target = oMeta.target;
    let i, l, item;

    target.sort(comparator);
    for (i = 0, l = target.length; i < l; i++) {
      item = target[i];
      if (item && typeof item === "object") {
        const tmpObserved = item[oMetaKey];
        if (tmpObserved) {
          tmpObserved.ownKey = i;
        }
      }
    }

    const changes = [new Change(SHUFFLE, [], undefined, undefined, this)];
    callObservers(oMeta, changes);

    return this;
  },
  proxiedFill = function proxiedFill(filVal, start, end) {
    const oMeta = this[oMetaKey],
      target = oMeta.target,
      changes = [],
      tarLen = target.length,
      prev = target.slice(0);
    start =
      start === undefined
        ? 0
        : start < 0
        ? Math.max(tarLen + start, 0)
        : Math.min(start, tarLen);
    end =
      end === undefined
        ? tarLen
        : end < 0
        ? Math.max(tarLen + end, 0)
        : Math.min(end, tarLen);

    if (start < tarLen && end > start) {
      target.fill(filVal, start, end);

      let tmpObserved;
      for (let i = start, item, tmpTarget; i < end; i++) {
        item = target[i];
        target[i] = getObservedOf(item, i, oMeta);
        if (i in prev) {
          tmpTarget = prev[i];
          if (tmpTarget && typeof tmpTarget === "object") {
            tmpObserved = tmpTarget[oMetaKey];
            if (tmpObserved) {
              tmpTarget = tmpObserved.detach();
            }
          }

          changes.push(new Change(UPDATE, [i], target[i], tmpTarget, this));
        } else {
          changes.push(new Change(INSERT, [i], target[i], undefined, this));
        }
      }

      callObservers(oMeta, changes);
    }

    return this;
  },
  proxiedCopyWithin = function proxiedCopyWithin(dest, start, end) {
    const oMeta = this[oMetaKey],
      target = oMeta.target,
      tarLen = target.length;
    dest = dest < 0 ? Math.max(tarLen + dest, 0) : dest;
    start =
      start === undefined
        ? 0
        : start < 0
        ? Math.max(tarLen + start, 0)
        : Math.min(start, tarLen);
    end =
      end === undefined
        ? tarLen
        : end < 0
        ? Math.max(tarLen + end, 0)
        : Math.min(end, tarLen);
    const len = Math.min(end - start, tarLen - dest);

    if (dest < tarLen && dest !== start && len > 0) {
      const prev = target.slice(0),
        changes = [];

      target.copyWithin(dest, start, end);

      for (let i = dest, nItem, oItem, tmpObserved; i < dest + len; i++) {
        //	update newly placed observables, if any
        nItem = target[i];
        if (nItem && typeof nItem === "object") {
          nItem = getObservedOf(nItem, i, oMeta);
          target[i] = nItem;
        }

        //	detach overridden observables, if any
        oItem = prev[i];
        if (oItem && typeof oItem === "object") {
          tmpObserved = oItem[oMetaKey];
          if (tmpObserved) {
            oItem = tmpObserved.detach();
          }
        }

        if (typeof nItem !== "object" && nItem === oItem) {
          continue;
        }
        changes.push(new Change(UPDATE, [i], nItem, oItem, this));
      }

      callObservers(oMeta, changes);
    }

    return this;
  },
  proxiedSplice = function proxiedSplice() {
    const oMeta = this[oMetaKey],
      target = oMeta.target,
      splLen = arguments.length,
      spliceContent = new Array(splLen),
      tarLen = target.length;

    //	observify the newcomers
    for (let i = 0; i < splLen; i++) {
      spliceContent[i] = getObservedOf(arguments[i], i, oMeta);
    }

    //	calculate pointers
    const startIndex =
        splLen === 0
          ? 0
          : spliceContent[0] < 0
          ? tarLen + spliceContent[0]
          : spliceContent[0],
      removed = splLen < 2 ? tarLen - startIndex : spliceContent[1],
      inserted = Math.max(splLen - 2, 0),
      spliceResult = Reflect.apply(target.splice, target, spliceContent),
      newTarLen = target.length;

    //	reindex the paths
    let tmpObserved;
    for (let i = 0, item; i < newTarLen; i++) {
      item = target[i];
      if (item && typeof item === "object") {
        tmpObserved = item[oMetaKey];
        if (tmpObserved) {
          tmpObserved.ownKey = i;
        }
      }
    }

    //	detach removed objects
    let i, l, item;
    for (i = 0, l = spliceResult.length; i < l; i++) {
      item = spliceResult[i];
      if (item && typeof item === "object") {
        tmpObserved = item[oMetaKey];
        if (tmpObserved) {
          spliceResult[i] = tmpObserved.detach();
        }
      }
    }

    const changes = [];
    let index;
    for (index = 0; index < removed; index++) {
      if (index < inserted) {
        changes.push(
          new Change(
            UPDATE,
            [startIndex + index],
            target[startIndex + index],
            spliceResult[index],
            this
          )
        );
      } else {
        changes.push(
          new Change(
            DELETE,
            [startIndex + index],
            undefined,
            spliceResult[index],
            this
          )
        );
      }
    }
    for (; index < inserted; index++) {
      changes.push(
        new Change(
          INSERT,
          [startIndex + index],
          target[startIndex + index],
          undefined,
          this
        )
      );
    }
    callObservers(oMeta, changes);

    return spliceResult;
  },
  proxiedTypedArraySet = function proxiedTypedArraySet(source, offset) {
    const oMeta = this[oMetaKey],
      target = oMeta.target,
      souLen = source.length,
      prev = target.slice(0);
    offset = offset || 0;

    target.set(source, offset);
    const changes = new Array(souLen);
    for (let i = offset; i < souLen + offset; i++) {
      changes[i - offset] = new Change(UPDATE, [i], target[i], prev[i], this);
    }

    callObservers(oMeta, changes);
  },
  proxiedArrayMethods = {
    pop: proxiedPop,
    push: proxiedPush,
    shift: proxiedShift,
    unshift: proxiedUnshift,
    reverse: proxiedReverse,
    sort: proxiedSort,
    fill: proxiedFill,
    copyWithin: proxiedCopyWithin,
    splice: proxiedSplice,
  },
  proxiedTypedArrayMethods = {
    reverse: proxiedReverse,
    sort: proxiedSort,
    fill: proxiedFill,
    copyWithin: proxiedCopyWithin,
    set: proxiedTypedArraySet,
  };

class Change {
  constructor(type, path, value, oldValue, object) {
    this.type = type;
    this.path = path;
    this.value = value;
    this.oldValue = oldValue;
    this.object = object;
  }
}

class OMetaBase {
  constructor(properties, cloningFunction) {
    const { target, parent, ownKey } = properties;
    if (parent && ownKey !== undefined) {
      this.parent = parent;
      this.ownKey = ownKey;
    } else {
      this.parent = null;
      this.ownKey = null;
    }
    const targetClone = cloningFunction(target, this);
    this.observers = [];
    this.revocable = Proxy.revocable(targetClone, this);
    this.proxy = this.revocable.proxy;
    this.target = targetClone;
    this.options = this.processOptions(properties.options);
    if (this.options.async) {
      this.batches = [];
    }
  }

  processOptions(options) {
    if (options) {
      if (typeof options !== "object") {
        throw new Error(
          `Observable options if/when provided, MAY only be an object, got '${options}'`
        );
      }
      const invalidOptions = Object.keys(options).filter(
        (option) => !(option in validObservableOptionKeys)
      );
      if (invalidOptions.length) {
        throw new Error(
          `'${invalidOptions.join(
            ", "
          )}' is/are not a valid Observable option/s`
        );
      }
      return Object.assign({}, options);
    } else {
      return {};
    }
  }

  detach() {
    this.parent = null;
    return this.target;
  }

  set(target, key, value) {
    let oldValue = target[key];

    if (value !== oldValue) {
      const newValue = getObservedOf(value, key, this);
      target[key] = newValue;

      if (oldValue && typeof oldValue === "object") {
        const tmpObserved = oldValue[oMetaKey];
        if (tmpObserved) {
          oldValue = tmpObserved.detach();
        }
      }

      const changes =
        oldValue === undefined
          ? [new Change(INSERT, [key], newValue, undefined, this.proxy)]
          : [new Change(UPDATE, [key], newValue, oldValue, this.proxy)];
      callObservers(this, changes);
    }

    return true;
  }

  deleteProperty(target, key) {
    let oldValue = target[key];

    delete target[key];

    if (oldValue && typeof oldValue === "object") {
      const tmpObserved = oldValue[oMetaKey];
      if (tmpObserved) {
        oldValue = tmpObserved.detach();
      }
    }

    const changes = [
      new Change(DELETE, [key], undefined, oldValue, this.proxy),
    ];
    callObservers(this, changes);

    return true;
  }
}

class ObjectOMeta extends OMetaBase {
  constructor(properties) {
    super(properties, prepareObject);
  }
}

class ArrayOMeta extends OMetaBase {
  constructor(properties) {
    super(properties, prepareArray);
  }

  get(target, key) {
    return proxiedArrayMethods[key] || target[key];
  }
}

class TypedArrayOMeta extends OMetaBase {
  constructor(properties) {
    super(properties, prepareTypedArray);
  }

  get(target, key) {
    return proxiedTypedArrayMethods[key] || target[key];
  }
}

const Observable = Object.freeze({
  from: (target, options) => {
    if (!target || typeof target !== "object") {
      throw new Error("observable MAY ONLY be created from a non-null object");
    } else if (target[oMetaKey]) {
      return target;
    } else if (Array.isArray(target)) {
      return new ArrayOMeta({
        target: target,
        ownKey: null,
        parent: null,
        options: options,
      }).proxy;
    } else if (ArrayBuffer.isView(target)) {
      return new TypedArrayOMeta({
        target: target,
        ownKey: null,
        parent: null,
        options: options,
      }).proxy;
    } else if (target instanceof Date) {
      throw new Error(`${target} found to be one of a non-observable types`);
    } else {
      return new ObjectOMeta({
        target: target,
        ownKey: null,
        parent: null,
        options: options,
      }).proxy;
    }
  },
  isObservable: (input) => {
    return !!(input && input[oMetaKey]);
  },
  observe: (observable, observer, options) => {
    if (!Observable.isObservable(observable)) {
      throw new Error(`invalid observable parameter`);
    }
    if (typeof observer !== "function") {
      throw new Error(`observer MUST be a function, got '${observer}'`);
    }

    const observers = observable[oMetaKey].observers;
    if (!observers.some((o) => o[0] === observer)) {
      observers.push([observer, processObserveOptions(options)]);
    } else {
      console.warn(
        "observer may be bound to an observable only once; will NOT rebind"
      );
    }
  },
  unobserve: (observable, ...observers) => {
    if (!Observable.isObservable(observable)) {
      throw new Error(`invalid observable parameter`);
    }

    const existingObs = observable[oMetaKey].observers;
    let el = existingObs.length;
    if (!el) {
      return;
    }

    if (!observers.length) {
      existingObs.splice(0);
      return;
    }

    while (el) {
      let i = observers.indexOf(existingObs[--el][0]);
      if (i >= 0) {
        existingObs.splice(el, 1);
      }
    }
  },
});

var EventHandler = /** @class */ (function () {
    function EventHandler() {
        var _this = this;
        this.on = function (event, func) {
            _this.handlers[event] = _this.handlers[event] || [];
            _this.handlers[event].push(func);
            return _this;
        };
        this.off = function (event, func) {
            var _handlers = _this.handlers[event];
            if (_handlers) {
                for (var i = 0; i < _handlers.length; i++) {
                    if (_handlers[i] === func) {
                        _handlers.splice(i, 1);
                    }
                }
            }
            return _this;
        };
        this.callEmitFromMT = function callEmitFromMT() {
            this.func.apply(null, this.args ? this.args : []);
        };
        this.emit = function (event, args) {
            if (_this.handlers[event]) {
                for (var i = 0; i < _this.handlers[event].length; i++) {
                    try {
                        queueMicrotask(_this.callEmitFromMT.bind({
                            func: _this.handlers[event][i],
                            args: args,
                        }));
                    }
                    catch (err) {
                        console.log(err);
                    }
                }
            }
            return _this;
        };
        this.clear = function () {
            _this.handlers = {};
        };
        this.handlers = {};
    }
    return EventHandler;
}());

var ServiceHandler = /** @class */ (function (_super) {
    __extends(ServiceHandler, _super);
    function ServiceHandler(parent) {
        var _this = _super.call(this) || this;
        Object.keys(parent.property).forEach(function (key) {
            _this.on(key, function (payload) {
                try {
                    parent.property[key].apply(parent.state, [payload]);
                }
                catch (error) {
                    console.log(error);
                }
            });
        });
        return _this;
    }
    return ServiceHandler;
}(EventHandler));

var PropertyHandler = /** @class */ (function (_super) {
    __extends(PropertyHandler, _super);
    function PropertyHandler(init_property, options) {
        var _this = this;
        var _a, _b;
        _this = _super.call(this) || this;
        _this.middlewares = [];
        _this._sendHistory = [];
        _this.watch = function (changes) { return __awaiter(_this, void 0, void 0, function () {
            var startTime, duration;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = performance.now();
                        return [4 /*yield*/, this.executeMiddlewares(changes, function () {
                                var _a;
                                var _loop_1 = function (change) {
                                    var paths = change.path.filter(function (d) { return typeof d != "number"; });
                                    if ((_a = _this._options) === null || _a === void 0 ? void 0 : _a.deep) {
                                        var eventName_1 = "";
                                        paths.forEach(function (item) {
                                            eventName_1 += item + ".";
                                            _this.emit(eventName_1.substring(0, eventName_1.length - 1), [change.object]);
                                        });
                                    }
                                    else {
                                        var eventName = paths.join(".");
                                        _this.emit(eventName, [change.object]);
                                    }
                                };
                                for (var _i = 0, changes_1 = changes; _i < changes_1.length; _i++) {
                                    var change = changes_1[_i];
                                    _loop_1(change);
                                }
                            })];
                    case 1:
                        _a.sent();
                        if (process.env.NODE_ENV === "development") {
                            duration = performance.now() - startTime;
                            if (duration > 33.34) {
                                console.warn("[x-view-model] Slow state update detected (".concat(duration.toFixed(2), "ms)"), changes);
                            }
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        _this._property = init_property;
        _this._options = options;
        _this._reference = 0;
        _this._observable = Observable.from(__assign({}, _this._property), { async: true });
        _this._started = false;
        _this.services = new ServiceHandler(_this);
        // 히스토리 설정 초기화
        _this._historyHandler = ((_a = options === null || options === void 0 ? void 0 : options.history) === null || _a === void 0 ? void 0 : _a.handler) || (function () { });
        _this._historyMaxSize = ((_b = options === null || options === void 0 ? void 0 : options.history) === null || _b === void 0 ? void 0 : _b.maxSize) || 100;
        _this.middlewares = (options === null || options === void 0 ? void 0 : options.middlewares) || [];
        return _this;
    }
    PropertyHandler.prototype.use = function (middleware) {
        this.middlewares.push(middleware);
        return this;
    };
    PropertyHandler.prototype.executeMiddlewares = function (changes, next) {
        return __awaiter(this, void 0, void 0, function () {
            var chain;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 미들웨어가 없는 경우 바로 next 실행
                        if (this.middlewares.length === 0) {
                            next();
                            return [2 /*return*/];
                        }
                        chain = this.middlewares.reduceRight(function (nextMiddleware, currentMiddleware) {
                            return function () { return currentMiddleware(changes, nextMiddleware, _this.state); };
                        }, next);
                        return [4 /*yield*/, chain()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(PropertyHandler.prototype, "state", {
        get: function () {
            return this._observable;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PropertyHandler.prototype, "property", {
        get: function () {
            return this._property;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PropertyHandler.prototype, "reference", {
        get: function () {
            return this._reference;
        },
        set: function (val) {
            this._reference = val;
            if (this._reference > 0) {
                this.start();
            }
            else {
                this.stop();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PropertyHandler.prototype, "name", {
        get: function () {
            return this._options && this._options.name ? this._options.name : "unnamed";
        },
        enumerable: false,
        configurable: true
    });
    PropertyHandler.prototype.increaseReference = function () {
        this.reference++;
    };
    PropertyHandler.prototype.decreaseReference = function () {
        this.reference--;
    };
    PropertyHandler.prototype.start = function () {
        if (this._started)
            return;
        Observable.observe(this._observable, this.watch);
        console.log(this.name, "started");
        this._started = true;
        return this;
    };
    PropertyHandler.prototype.stop = function () {
        if (!this._started)
            return;
        Observable.unobserve(this._observable);
        this._observable = Observable.from(__assign({}, this._property));
        this._started = false;
        return this;
    };
    PropertyHandler.prototype.pause = function () {
        if (!this._started)
            return;
        Observable.unobserve(this._observable);
        return this;
    };
    PropertyHandler.prototype.restart = function () {
        Observable.unobserve(this._observable);
        this._observable = Observable.from(__assign({}, this._property));
        Observable.observe(this._observable, this.watch);
        console.log(this.name, "started");
        this._started = true;
        return this;
    };
    PropertyHandler.prototype.snapshot = function () {
        this.pause();
        var snapshotJson = JSON.stringify(this._observable);
        this.start();
        return snapshotJson;
    };
    PropertyHandler.prototype.rebase = function (json) {
        var rebaseObj = typeof json === "string" ? JSON.parse(json) : json;
        this._property = __assign(__assign({}, this._property), rebaseObj);
        return this;
    };
    PropertyHandler.prototype.restore = function (json) {
        this.pause();
        var restoreObj = typeof json === "string" ? JSON.parse(json) : json;
        this._observable = Observable.from(__assign(__assign({}, this._property), restoreObj));
        this.start();
        return this;
    };
    // 히스토리 추가 메소드
    PropertyHandler.prototype.addHistory = function (history) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._historyHandler) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.resolve(this._historyHandler(history, this.state))];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        // 히스토리 저장
                        this._sendHistory.push(history);
                        // maxSize 제한 처리
                        if (this._sendHistory.length > this._historyMaxSize) {
                            this._sendHistory = this._sendHistory.slice(-this._historyMaxSize);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PropertyHandler.prototype.send = function (name, payload, async) {
        if (async === void 0) { async = false; }
        return __awaiter(this, void 0, void 0, function () {
            var history, res, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        history = {
                            name: name,
                            payload: payload,
                            timestamp: Date.now(),
                        };
                        if (!async) return [3 /*break*/, 7];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 6]);
                        return [4 /*yield*/, this.property[name].apply(this.state, [
                                payload,
                            ])];
                    case 2:
                        res = _a.sent();
                        history.result = res;
                        return [4 /*yield*/, this.addHistory(history)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, res];
                    case 4:
                        error_1 = _a.sent();
                        history.error = error_1;
                        return [4 /*yield*/, this.addHistory(history)];
                    case 5:
                        _a.sent();
                        throw error_1;
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        this.services.emit(name, [payload]);
                        return [4 /*yield*/, this.addHistory(history)];
                    case 8:
                        _a.sent();
                        return [2 /*return*/, undefined];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    // 히스토리 조회 메소드
    PropertyHandler.prototype.getSendHistory = function () {
        return this._sendHistory;
    };
    // 히스토리 클리어 메소드
    PropertyHandler.prototype.clearSendHistory = function () {
        this._sendHistory = [];
    };
    return PropertyHandler;
}(EventHandler));

var useInterfaceHandle = function (keys, handle) {
    var _a = useState(0); _a[0]; var setRenderCount = _a[1];
    var changeState = useCallback(function (args) {
        setRenderCount(function (prev) { return prev + 1; });
    }, []);
    useMemo(function () {
        handle.increaseReference();
        if (Array.isArray(keys)) {
            keys.forEach(function (key) {
                handle.on(key, changeState);
            });
        }
        else {
            handle.on(keys, changeState);
        }
    }, [handle]);
    useEffect(function () {
        return function () {
            handle.decreaseReference();
            if (Array.isArray(keys)) {
                keys.forEach(function (key) {
                    handle.off(key, changeState);
                });
            }
            else {
                handle.off(keys, changeState);
            }
        };
    }, [handle]);
    return handle.state;
};

var registViewModel = function (data, options, ref) {
    var handler = new PropertyHandler(data, options);
    var vm = {
        context: handler,
        ref: ref,
    };
    return vm;
};
var useViewModel = function (vm, keys) {
    var _a, _b, _c;
    useRef("".concat(Date.now(), "-").concat(Math.random())).current;
    useRef(((_c = (_b = (_a = new Error().stack) === null || _a === void 0 ? void 0 : _a.split("\n")[2]) === null || _b === void 0 ? void 0 : _b.trim()) === null || _c === void 0 ? void 0 : _c.split(" ")[1]) || "Unknown").current;
    var state = useInterfaceHandle(keys, vm.context);
    return [state, vm.context.send, vm.ref];
};
var useComputedViewModel = function (vm, selector, keys) {
    var _a = useViewModel(vm, keys), state = _a[0], send = _a[1], controller = _a[2];
    var selectedState = useMemo(function () { return selector(state); }, [state, selector]);
    return [selectedState, send, controller];
};
var useMemoizedViewModel = function (vm, keys) {
    var _a = useViewModel(vm, keys), fullState = _a[0], send = _a[1], ref = _a[2];
    return [fullState, send, ref];
};

export { PropertyHandler, registViewModel, useComputedViewModel, useMemoizedViewModel, useViewModel };
//# sourceMappingURL=index.esm.js.map
