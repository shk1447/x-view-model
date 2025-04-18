'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');

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

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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

class EventHandler {
    constructor() {
        this.on = (event, func) => {
            this.handlers[event] = this.handlers[event] || [];
            this.handlers[event].push(func);
            return this;
        };
        this.off = (event, func) => {
            const _handlers = this.handlers[event];
            if (_handlers) {
                for (let i = 0; i < _handlers.length; i++) {
                    if (_handlers[i] === func) {
                        _handlers.splice(i, 1);
                    }
                }
            }
            return this;
        };
        this.callEmitFromMT = function callEmitFromMT() {
            this.func.apply(null, this.args ? this.args : []);
        };
        this.emit = (event, args) => {
            if (this.handlers[event]) {
                for (let i = 0; i < this.handlers[event].length; i++) {
                    try {
                        queueMicrotask(this.callEmitFromMT.bind({
                            func: this.handlers[event][i],
                            args: args,
                        }));
                    }
                    catch (err) {
                        console.log(err);
                    }
                }
            }
            return this;
        };
        this.clear = () => {
            this.handlers = {};
        };
        this.handlers = {};
    }
}

class NameSpacesHandler {
    constructor() {
        this.viewModels = {};
    }
    static getInstance() {
        if (!NameSpacesHandler.instance) {
            NameSpacesHandler.instance = new NameSpacesHandler();
        }
        return NameSpacesHandler.instance;
    }
    getUsedNamespace() {
        return Object.keys(this.viewModels);
    }
    addNamespace(name, handler) {
        this.viewModels[name] = handler;
    }
    removeNamespace(name) {
        delete this.viewModels[name];
    }
    getNameSapce(name) {
        return this.viewModels[name]
            ? this.viewModels[name]
            : undefined;
    }
}

class ServiceHandler extends EventHandler {
    constructor(parent) {
        super();
        Object.keys(parent.property).forEach((key) => {
            this.on(key, (payload) => {
                try {
                    parent.property[key].apply(parent.state, [payload]);
                }
                catch (error) {
                    console.log(error);
                }
            });
        });
    }
}

class PropertyHandler extends EventHandler {
    constructor(init_property, options) {
        super();
        this.middlewares = [];
        this.watch = (changes) => __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            yield this.executeMiddlewares(changes, () => {
                var _a;
                for (const change of changes) {
                    const paths = change.path.filter((d) => typeof d != "number");
                    if ((_a = this._options) === null || _a === void 0 ? void 0 : _a.deep) {
                        let eventName = "";
                        paths.forEach((item) => {
                            eventName += item + ".";
                            this.emit(eventName.substring(0, eventName.length - 1), [change.object]);
                        });
                    }
                    else {
                        const eventName = paths.join(".");
                        this.emit(eventName, [change.object]);
                    }
                }
            });
            if (process.env.NODE_ENV === "development") {
                const duration = performance.now() - startTime;
                if (duration > 33.34) {
                    console.warn(`[x-view-model] Slow state update detected (${duration.toFixed(2)}ms)`, changes);
                }
            }
        });
        this._property = init_property;
        this._options = options;
        this._reference = 0;
        this._observable = Observable.from(Object.assign({}, this._property), { async: true });
        this._started = false;
        this.services = new ServiceHandler(this);
        this.namespaces = NameSpacesHandler.getInstance();
        this.middlewares = (options === null || options === void 0 ? void 0 : options.middlewares) || [];
    }
    use(middleware) {
        this.middlewares.push(middleware);
        return this;
    }
    executeMiddlewares(changes, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // 미들웨어가 없는 경우 바로 next 실행
            if (this.middlewares.length === 0) {
                next();
                return;
            }
            const chain = this.middlewares.reduceRight((nextMiddleware, currentMiddleware) => {
                return () => currentMiddleware(changes, nextMiddleware, this.state);
            }, next);
            yield chain();
        });
    }
    get state() {
        return this._observable;
    }
    get property() {
        return this._property;
    }
    get reference() {
        return this._reference;
    }
    get name() {
        return this._options && this._options.name ? this._options.name : "unnamed";
    }
    set reference(val) {
        this._reference = val;
        if (this._reference > 0) {
            if (this.name)
                this.namespaces.addNamespace(this.name, this);
            this.start();
        }
        else {
            if (this.name)
                this.namespaces.removeNamespace(this.name);
            this.stop();
        }
    }
    increaseReference() {
        this.reference++;
    }
    decreaseReference() {
        this.reference--;
    }
    start() {
        if (this._started)
            return;
        Observable.observe(this._observable, this.watch);
        console.log(this.name, "started");
        this._started = true;
        return this;
    }
    stop() {
        if (!this._started)
            return;
        Observable.unobserve(this._observable);
        this._observable = Observable.from(Object.assign({}, this._property));
        this._started = false;
        return this;
    }
    pause() {
        if (!this._started)
            return;
        Observable.unobserve(this._observable);
        return this;
    }
    restart() {
        Observable.unobserve(this._observable);
        this._observable = Observable.from(Object.assign({}, this._property));
        Observable.observe(this._observable, this.watch);
        console.log(this.name, "started");
        this._started = true;
        return this;
    }
    snapshot() {
        this.pause();
        const snapshotJson = JSON.stringify(this._observable);
        this.start();
        return snapshotJson;
    }
    rebase(json) {
        const rebaseObj = typeof json === "string" ? JSON.parse(json) : json;
        this._property = Object.assign(Object.assign({}, this._property), rebaseObj);
        return this;
    }
    restore(json) {
        this.pause();
        const restoreObj = typeof json === "string" ? JSON.parse(json) : json;
        this._observable = Observable.from(Object.assign(Object.assign({}, this._property), restoreObj));
        this.start();
        return this;
    }
    send(name, payload, async = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (async) {
                try {
                    const res = yield this.property[name].apply(this.state, [
                        payload,
                    ]);
                    return res;
                }
                catch (error) {
                    throw error;
                }
            }
            else {
                this.services.emit(name, [payload]);
                return undefined;
            }
        });
    }
}

const useInterfaceHandle = (keys, handle) => {
    const [renderCount, setRenderCount] = react.useState(0);
    const changeState = react.useCallback((args) => {
        if (process.env.NODE_ENV === "development") {
            console.debug("[x-view-model] State update", "args: ", args);
        }
        setRenderCount((prev) => prev + 1);
    }, []);
    react.useMemo(() => {
        handle.increaseReference();
        if (Array.isArray(keys)) {
            keys.forEach((key) => {
                handle.on(key, changeState);
            });
        }
        else {
            handle.on(keys, changeState);
        }
    }, [handle]);
    react.useEffect(() => {
        return () => {
            handle.decreaseReference();
            if (Array.isArray(keys)) {
                keys.forEach((key) => {
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

const registViewModel = (data, options, ref) => {
    const handler = new PropertyHandler(data, options);
    const vm = {
        context: handler,
        ref: ref,
    };
    return vm;
};
const useViewModel = (vm, keys) => {
    const state = useInterfaceHandle(keys, vm.context);
    const send = (name, payload, async = false) => __awaiter(void 0, void 0, void 0, function* () {
        if (async) {
            try {
                const res = yield vm.context.property[name].apply(vm.context.state, [payload]);
                return res;
            }
            catch (error) {
                throw error;
            }
        }
        else {
            vm.context.services.emit(name, [payload]);
            return undefined;
        }
    });
    return [state, send, vm.ref];
};
const useComputedViewModel = (vm, selector, keys) => {
    const [state, send, controller] = useViewModel(vm, keys);
    const selectedState = react.useMemo(() => selector(state), [state, selector]);
    return [selectedState, send, controller];
};
// src/core/hooks/useMemoizedViewModel.ts
const useMemoizedViewModel = (vm, keys) => {
    const [fullState, send, ref] = useViewModel(vm, keys);
    return [fullState, send, ref];
};

exports.PropertyHandler = PropertyHandler;
exports.registViewModel = registViewModel;
exports.useComputedViewModel = useComputedViewModel;
exports.useMemoizedViewModel = useMemoizedViewModel;
exports.useViewModel = useViewModel;
//# sourceMappingURL=index.js.map
