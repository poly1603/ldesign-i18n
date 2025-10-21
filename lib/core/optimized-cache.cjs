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

class LRUNode {
  constructor() {
    Object.defineProperty(this, "key", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "value", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "expires", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "prev", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "next", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
  }
  reset(key, value, expires) {
    this.key = key;
    this.value = value;
    this.expires = expires;
    this.prev = null;
    this.next = null;
  }
}
class NodePool {
  constructor() {
    Object.defineProperty(this, "pool", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "maxSize", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 100
    });
  }
  get() {
    return this.pool.pop() || new LRUNode();
  }
  release(node) {
    if (this.pool.length < this.maxSize) {
      node.prev = null;
      node.next = null;
      this.pool.push(node);
    }
  }
}
class OptimizedLRUCache {
  constructor(maxSize = 1e3, defaultTTL) {
    Object.defineProperty(this, "maxSize", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "cache", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "head", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "tail", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "defaultTTL", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "nodePool", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: new NodePool()
    });
    Object.defineProperty(this, "cleanupTimer", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "CLEANUP_INTERVAL", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 6e4
    });
    this.maxSize = maxSize > 0 ? maxSize : 1e3;
    this.defaultTTL = defaultTTL;
    if (defaultTTL && typeof setInterval !== "undefined") {
      this.cleanupTimer = setInterval(() => this.cleanupExpired(), this.CLEANUP_INTERVAL);
      if (typeof this.cleanupTimer?.unref === "function") {
        this.cleanupTimer.unref();
      }
    }
  }
  get(key) {
    const node = this.cache.get(key);
    if (!node) {
      return void 0;
    }
    if (node.expires && Date.now() > node.expires) {
      this.delete(key);
      return void 0;
    }
    this.moveToHead(node);
    return node.value;
  }
  set(key, value, ttl) {
    let node = this.cache.get(key);
    if (node) {
      node.value = value;
      const effectiveTTL = ttl ?? this.defaultTTL;
      node.expires = effectiveTTL ? Date.now() + effectiveTTL : void 0;
      this.moveToHead(node);
    } else {
      if (this.cache.size >= this.maxSize && this.tail) {
        const oldNode = this.tail;
        this.cache.delete(oldNode.key);
        this.removeNode(oldNode);
        this.nodePool.release(oldNode);
      }
      const effectiveTTL = ttl ?? this.defaultTTL;
      const expires = effectiveTTL ? Date.now() + effectiveTTL : void 0;
      node = this.nodePool.get();
      node.reset(key, value, expires);
      this.cache.set(key, node);
      this.addToHead(node);
    }
  }
  has(key) {
    const node = this.cache.get(key);
    if (!node) {
      return false;
    }
    if (node.expires && Date.now() > node.expires) {
      this.delete(key);
      return false;
    }
    return true;
  }
  delete(key) {
    const node = this.cache.get(key);
    if (!node) return false;
    this.removeNode(node);
    this.nodePool.release(node);
    return this.cache.delete(key);
  }
  clear() {
    this.cache.forEach((node) => this.nodePool.release(node));
    this.cache.clear();
    this.head = null;
    this.tail = null;
  }
  get size() {
    this.cleanupExpired();
    return this.cache.size;
  }
  // O(1) 移动节点到头部
  moveToHead(node) {
    this.removeNode(node);
    this.addToHead(node);
  }
  // O(1) 添加节点到头部
  addToHead(node) {
    node.next = this.head;
    node.prev = null;
    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
  }
  // O(1) 从链表中移除节点
  removeNode(node) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }
  // 清理过期项 - 优化版，限制单次清理数量
  cleanupExpired() {
    if (this.cache.size === 0) return;
    const now = Date.now();
    const maxCleanup = Math.min(100, Math.ceil(this.cache.size * 0.1));
    let cleaned = 0;
    for (const [key, node] of this.cache) {
      if (node.expires && now > node.expires) {
        this.delete(key);
        if (++cleaned >= maxCleanup) break;
      }
    }
  }
  /**
   * 清理所有资源
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = void 0;
    }
    this.clear();
  }
}
class OptimizedWeakCache {
  constructor() {
    Object.defineProperty(this, "cache", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new WeakMap()
    });
    Object.defineProperty(this, "maxTimers", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 1e3
    });
    Object.defineProperty(this, "timerCount", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
  }
  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      return void 0;
    }
    if (item.expires && Date.now() > item.expires) {
      this.delete(key);
      return void 0;
    }
    return item.value;
  }
  set(key, value, ttl) {
    const existing = this.cache.get(key);
    if (existing?.timer) {
      clearTimeout(existing.timer);
      this.timerCount--;
    }
    const expires = ttl ? Date.now() + ttl : void 0;
    const item = {
      value,
      expires
    };
    if (ttl && this.timerCount < this.maxTimers) {
      item.timer = setTimeout(() => {
        this.delete(key);
      }, ttl);
      this.timerCount++;
    }
    this.cache.set(key, item);
  }
  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    if (item.expires && Date.now() > item.expires) {
      this.delete(key);
      return false;
    }
    return true;
  }
  delete(key) {
    const item = this.cache.get(key);
    if (item?.timer) {
      clearTimeout(item.timer);
      this.timerCount--;
    }
    return this.cache.delete(key);
  }
  /**
   * 清理所有定时器，防止内存泄漏
   */
  destroy() {
    this.timerCount = 0;
  }
}
class OptimizedStorageCache {
  constructor(storage = typeof window !== "undefined" ? window.localStorage : null, prefix = "i18n_cache_", maxSize = 100) {
    Object.defineProperty(this, "storage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "prefix", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "maxSize", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "writeTimer", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "pendingWrites", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "memoryCache", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "writeDelay", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 1e3
    });
    this.storage = storage;
    this.prefix = prefix;
    this.maxSize = maxSize > 0 ? maxSize : 100;
    if (this.storage) {
      this.loadExistingCache();
    }
  }
  loadExistingCache() {
    if (!this.storage) return;
    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(this.prefix)) {
          const item = this.storage.getItem(key);
          if (item) {
            try {
              const parsed = JSON.parse(item);
              const actualKey = key.substring(this.prefix.length);
              this.memoryCache.set(actualKey, {
                value: parsed.value,
                expires: parsed.expires
              });
            } catch {
            }
          }
        }
      }
    } catch {
    }
  }
  get(key) {
    const cached = this.memoryCache.get(key);
    if (cached) {
      if (cached.expires && Date.now() > cached.expires) {
        this.delete(key);
        return void 0;
      }
      return cached.value;
    }
    if (!this.storage) return void 0;
    try {
      const item = this.storage.getItem(this.prefix + key);
      if (!item) return void 0;
      const parsed = JSON.parse(item);
      if (parsed.expires && Date.now() > parsed.expires) {
        this.delete(key);
        return void 0;
      }
      this.memoryCache.set(key, {
        value: parsed.value,
        expires: parsed.expires
      });
      return parsed.value;
    } catch {
      return void 0;
    }
  }
  set(key, value, ttl) {
    const expires = ttl ? Date.now() + ttl : void 0;
    this.memoryCache.set(key, {
      value,
      expires
    });
    if (this.storage) {
      this.pendingWrites.set(key, {
        value,
        ttl
      });
      this.scheduleWrite();
    }
  }
  scheduleWrite() {
    if (this.writeTimer !== null) {
      clearTimeout(this.writeTimer);
    }
    this.writeTimer = window.setTimeout(() => {
      this.flushWrites();
      this.writeTimer = null;
    }, this.writeDelay);
  }
  flushWrites() {
    if (!this.storage || this.pendingWrites.size === 0) return;
    const doWrite = () => {
      try {
        if (this.size >= this.maxSize) {
          this.evictOldest();
        }
        this.pendingWrites.forEach(({
          value,
          ttl
        }, key) => {
          const expires = ttl ? Date.now() + ttl : void 0;
          const item = JSON.stringify({
            value,
            expires,
            timestamp: Date.now()
          });
          this.storage.setItem(this.prefix + key, item);
        });
        this.pendingWrites.clear();
      } catch (error) {
        console.warn("Failed to cache items:", error);
      }
    };
    if ("requestIdleCallback" in window) {
      requestIdleCallback(doWrite);
    } else {
      doWrite();
    }
  }
  has(key) {
    return this.get(key) !== void 0;
  }
  delete(key) {
    if (!this.storage) return false;
    try {
      this.storage.removeItem(this.prefix + key);
      this.pendingWrites.delete(key);
      this.memoryCache.delete(key);
      return true;
    } catch {
      return false;
    }
  }
  clear() {
    if (!this.storage) return;
    const keysToRemove = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => this.storage.removeItem(key));
    this.pendingWrites.clear();
    this.memoryCache.clear();
  }
  get size() {
    if (!this.storage) return 0;
    let count = 0;
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        count++;
      }
    }
    return count;
  }
  evictOldest() {
    if (!this.storage) return;
    let oldestKey = null;
    let oldestTime = Infinity;
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        try {
          const item = this.storage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (parsed.timestamp < oldestTime) {
              oldestTime = parsed.timestamp;
              oldestKey = key;
            }
          }
        } catch {
        }
      }
    }
    if (oldestKey) {
      this.storage.removeItem(oldestKey);
    }
  }
  /**
   * 清理所有资源
   */
  destroy() {
    if (this.writeTimer !== null) {
      clearTimeout(this.writeTimer);
      this.writeTimer = null;
    }
    this.flushWrites();
    this.pendingWrites.clear();
    this.memoryCache.clear();
  }
}
function createOptimizedCache(options = {}) {
  const {
    type = "memory",
    maxSize = 1e3,
    ttl,
    storage = "local"
  } = options;
  switch (type) {
    case "storage":
      if (typeof window === "undefined") {
        return new OptimizedLRUCache(maxSize, ttl);
      }
      return new OptimizedStorageCache(storage === "session" ? window.sessionStorage : window.localStorage);
    case "memory":
    default:
      return new OptimizedLRUCache(maxSize, ttl);
  }
}

exports.OptimizedLRUCache = OptimizedLRUCache;
exports.OptimizedStorageCache = OptimizedStorageCache;
exports.OptimizedWeakCache = OptimizedWeakCache;
exports.createOptimizedCache = createOptimizedCache;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=optimized-cache.cjs.map
