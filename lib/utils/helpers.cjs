/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

function isPlainObject(obj) {
  return obj !== null && typeof obj === "object" && obj.constructor === Object;
}
function isString(value) {
  return typeof value === "string";
}
function isFunction(value) {
  return typeof value === "function";
}
function isPromise(value) {
  return value instanceof Promise || value !== null && typeof value === "object" && isFunction(value.then) && isFunction(value.catch);
}
function deepClone(obj, maxDepth = 10, currentDepth = 0) {
  if (obj === null || typeof obj !== "object") return obj;
  if (currentDepth >= maxDepth) return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);
  if (Array.isArray(obj)) {
    const arr = Array.from({
      length: obj.length
    });
    for (let i = 0; i < obj.length; i++) {
      arr[i] = deepClone(obj[i], maxDepth, currentDepth + 1);
    }
    return arr;
  }
  if (obj instanceof Set) {
    const set = /* @__PURE__ */ new Set();
    for (const item of obj) {
      set.add(deepClone(item, maxDepth, currentDepth + 1));
    }
    return set;
  }
  if (obj instanceof Map) {
    const map = /* @__PURE__ */ new Map();
    for (const [k, v] of obj) {
      map.set(k, deepClone(v, maxDepth, currentDepth + 1));
    }
    return map;
  }
  const cloned = Object.create(Object.getPrototypeOf(obj));
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    cloned[key] = deepClone(obj[key], maxDepth, currentDepth + 1);
  }
  return cloned;
}
function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  for (const source of sources) {
    if (!source) continue;
    if (isPlainObject(target) && isPlainObject(source)) {
      const keys = Object.keys(source);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const sourceValue = source[key];
        if (isPlainObject(sourceValue)) {
          if (!target[key]) {
            target[key] = {};
          }
          deepMerge(target[key], sourceValue);
        } else {
          target[key] = sourceValue;
        }
      }
    }
  }
  return target;
}
const pathCache = /* @__PURE__ */ new Map();
const PATH_CACHE_MAX = 500;
function getNestedValue(obj, path, separator = ".") {
  if (!path) return obj;
  let keys = pathCache.get(path);
  if (!keys) {
    keys = path.split(separator);
    if (pathCache.size < PATH_CACHE_MAX) {
      pathCache.set(path, keys);
    }
  }
  let current = obj;
  for (let i = 0; i < keys.length; i++) {
    if (current == null) return void 0;
    current = current[keys[i]];
  }
  return current;
}
function setNestedValue(obj, path, value, separator = ".") {
  if (!path) return;
  const keys = path.split(separator);
  const lastKey = keys.pop();
  if (!lastKey) return;
  let current = obj;
  for (const key of keys) {
    if (!isPlainObject(current[key])) {
      current[key] = {};
    }
    current = current[key];
  }
  current[lastKey] = value;
}
function flattenObject(obj, prefix = "", separator = ".") {
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}${separator}${key}` : key;
      if (isPlainObject(obj[key]) && Object.keys(obj[key]).length > 0) {
        Object.assign(result, flattenObject(obj[key], newKey, separator));
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
}
function unflattenObject(obj, separator = ".") {
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      setNestedValue(result, key, obj[key], separator);
    }
  }
  return result;
}
const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;"
};
const HTML_ESCAPE_REGEX = /[&<>"'/]/g;
function escapeHtml(str) {
  return str.replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPE_MAP[char]);
}
function generateCacheKey(locale, key, namespace) {
  return namespace ? `${locale}:${namespace}:${key}` : `${locale}:${key}`;
}
function parseLocale(locale) {
  const parts = locale.split(/[-_]/);
  return {
    language: parts[0].toLowerCase(),
    region: parts[1]?.toUpperCase()
  };
}
function formatLocale(language, region) {
  return region ? `${language}-${region}` : language;
}
function getBrowserLanguage() {
  if (typeof window === "undefined") return null;
  const nav = window.navigator;
  const language = nav.language || nav.userLanguage || nav.browserLanguage;
  return language || null;
}
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}
function throttle(fn, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
class EventEmitter {
  constructor() {
    Object.defineProperty(this, "events", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "maxListeners", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 100
    });
    Object.defineProperty(this, "listenerCount", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
  }
  on(event, listener) {
    let listeners = this.events.get(event);
    if (!listeners) {
      listeners = /* @__PURE__ */ new Set();
      this.events.set(event, listeners);
    }
    if (this.listenerCount >= this.maxListeners) {
      console.warn(`[@ldesign/i18n] Max listeners (${this.maxListeners}) exceeded`);
      return () => {
      };
    }
    listeners.add(listener);
    this.listenerCount++;
    return () => {
      if (listeners.delete(listener)) {
        this.listenerCount--;
      }
    };
  }
  off(event, listener) {
    const listeners = this.events.get(event);
    if (listeners?.delete(listener)) {
      this.listenerCount--;
      if (listeners.size === 0) {
        this.events.delete(event);
      }
    }
  }
  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
  emit(event, ...args) {
    const listeners = this.events.get(event);
    if (!listeners || listeners.size === 0) return;
    for (const listener of listeners) {
      try {
        listener(...args);
      } catch (error2) {
        console.error(`[@ldesign/i18n] Error in event listener for "${event}":`, error2);
      }
    }
  }
  removeAllListeners(event) {
    if (event) {
      const listeners = this.events.get(event);
      if (listeners) {
        this.listenerCount -= listeners.size;
        this.events.delete(event);
      }
    } else {
      this.events.clear();
      this.listenerCount = 0;
    }
  }
}
function warn(message, ...args) {
  if (typeof window !== "undefined" && window.__DEV__ === true) {
    console.warn(`[@ldesign/i18n] ${message}`, ...args);
  }
}
function error(message, ...args) {
  if (typeof window !== "undefined" && window.__DEV__ === true) {
    console.error(`[@ldesign/i18n] ${message}`, ...args);
  }
}

exports.EventEmitter = EventEmitter;
exports.debounce = debounce;
exports.deepClone = deepClone;
exports.deepMerge = deepMerge;
exports.error = error;
exports.escapeHtml = escapeHtml;
exports.flattenObject = flattenObject;
exports.formatLocale = formatLocale;
exports.generateCacheKey = generateCacheKey;
exports.getBrowserLanguage = getBrowserLanguage;
exports.getNestedValue = getNestedValue;
exports.isFunction = isFunction;
exports.isPlainObject = isPlainObject;
exports.isPromise = isPromise;
exports.isString = isString;
exports.parseLocale = parseLocale;
exports.setNestedValue = setNestedValue;
exports.throttle = throttle;
exports.unflattenObject = unflattenObject;
exports.warn = warn;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=helpers.cjs.map
