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

class PerformanceMark {
  constructor(enabled = typeof performance !== "undefined") {
    Object.defineProperty(this, "marks", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "measures", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "enabled", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.enabled = enabled;
  }
  /**
   * Mark a performance point
   */
  mark(name) {
    if (!this.enabled) return;
    this.marks.set(name, performance.now());
  }
  /**
   * Measure time between marks
   */
  measure(name, startMark, endMark) {
    if (!this.enabled) return void 0;
    const start = this.marks.get(startMark);
    if (start === void 0) return void 0;
    const end = endMark ? this.marks.get(endMark) : performance.now();
    if (end === void 0) return void 0;
    const duration = end - start;
    if (!this.measures.has(name)) {
      this.measures.set(name, []);
    }
    this.measures.get(name).push(duration);
    return duration;
  }
  /**
   * Get average duration for a measure
   */
  getAverage(name) {
    const measures = this.measures.get(name);
    if (!measures || measures.length === 0) return void 0;
    const sum = measures.reduce((a, b) => a + b, 0);
    return sum / measures.length;
  }
  /**
   * Get all measures for a name
   */
  getMeasures(name) {
    return this.measures.get(name) || [];
  }
  /**
   * Clear all marks and measures
   */
  clear() {
    this.marks.clear();
    this.measures.clear();
  }
  /**
   * Get summary
   */
  getSummary() {
    const summary = {};
    for (const [name, measures] of this.measures) {
      if (measures.length > 0) {
        const sum = measures.reduce((a, b) => a + b, 0);
        summary[name] = {
          count: measures.length,
          avg: sum / measures.length,
          min: Math.min(...measures),
          max: Math.max(...measures)
        };
      }
    }
    return summary;
  }
}
function debounce(func, wait, options = {}) {
  const {
    leading = false,
    trailing = true,
    maxWait
  } = options;
  let timeoutId;
  let maxTimeoutId;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let lastArgs;
  let lastThis;
  let result;
  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;
    lastArgs = lastThis = void 0;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }
  function startTimer(pendingFunc, wait2) {
    return setTimeout(pendingFunc, wait2);
  }
  function cancelTimer(id) {
    if (id !== void 0) {
      clearTimeout(id);
    }
  }
  function leadingEdge(time) {
    lastInvokeTime = time;
    timeoutId = startTimer(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }
  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;
    return maxWait !== void 0 ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  }
  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    return lastCallTime === 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxWait !== void 0 && timeSinceLastInvoke >= maxWait;
  }
  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = startTimer(timerExpired, remainingWait(time));
  }
  function trailingEdge(time) {
    timeoutId = void 0;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = void 0;
    return result;
  }
  function cancel() {
    cancelTimer(timeoutId);
    cancelTimer(maxTimeoutId);
    lastInvokeTime = 0;
    lastCallTime = 0;
    lastArgs = lastThis = timeoutId = maxTimeoutId = void 0;
  }
  function flush() {
    return timeoutId === void 0 ? result : trailingEdge(Date.now());
  }
  function debounced(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;
    if (isInvoking) {
      if (timeoutId === void 0) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait !== void 0) {
        timeoutId = startTimer(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeoutId === void 0) {
      timeoutId = startTimer(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}
function throttle(func, wait, options = {}) {
  return debounce(func, wait, {
    leading: options.leading !== false,
    trailing: options.trailing !== false,
    maxWait: wait
  });
}
function memoize(func, options = {}) {
  const {
    maxSize = 100,
    resolver = JSON.stringify,
    ttl
  } = options;
  const cache = /* @__PURE__ */ new Map();
  const lruKeys = [];
  function memoized(...args) {
    const key = resolver(...args);
    const cached = cache.get(key);
    if (cached) {
      if (cached.expires && Date.now() > cached.expires) {
        cache.delete(key);
        const index = lruKeys.indexOf(key);
        if (index > -1) lruKeys.splice(index, 1);
      } else {
        const index = lruKeys.indexOf(key);
        if (index > -1) {
          lruKeys.splice(index, 1);
          lruKeys.push(key);
        }
        return cached.value;
      }
    }
    const result = func.apply(this, args);
    const entry = {
      value: result
    };
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    cache.set(key, entry);
    lruKeys.push(key);
    if (lruKeys.length > maxSize) {
      const oldestKey = lruKeys.shift();
      cache.delete(oldestKey);
    }
    return result;
  }
  memoized.cache = cache;
  memoized.clear = () => {
    cache.clear();
    lruKeys.length = 0;
  };
  return memoized;
}
class RAFScheduler {
  constructor() {
    Object.defineProperty(this, "rafId", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "callbacks", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
  }
  /**
   * Schedule a callback
   */
  schedule(callback) {
    this.callbacks.push(callback);
    if (this.rafId === null && typeof requestAnimationFrame !== "undefined") {
      this.rafId = requestAnimationFrame(() => this.flush());
    }
  }
  /**
   * Flush all pending callbacks
   */
  flush() {
    const callbacks = this.callbacks;
    this.callbacks = [];
    this.rafId = null;
    for (let i = 0; i < callbacks.length; i++) {
      try {
        callbacks[i]();
      } catch (err) {
        console.error("RAF callback error:", err);
      }
    }
  }
  /**
   * Cancel all pending callbacks
   */
  cancel() {
    if (this.rafId !== null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = null;
    this.callbacks = [];
  }
}

exports.PerformanceMark = PerformanceMark;
exports.RAFScheduler = RAFScheduler;
exports.debounce = debounce;
exports.memoize = memoize;
exports.throttle = throttle;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=performance.cjs.map
