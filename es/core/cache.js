/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class LRUNode {
  constructor(key, value, expires) {
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
    this.key = key;
    this.value = value;
    this.expires = expires;
  }
}
class LRUCache {
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
    Object.defineProperty(this, "cleanupTimer", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "hits", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    Object.defineProperty(this, "misses", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    this.maxSize = maxSize > 0 ? maxSize : 1e3;
    this.defaultTTL = defaultTTL;
    if (defaultTTL && typeof setInterval !== "undefined") {
      this.cleanupTimer = setInterval(() => this.cleanupExpired(), 6e4);
      if (typeof this.cleanupTimer?.unref === "function") {
        this.cleanupTimer.unref();
      }
    }
  }
  get(key) {
    const node = this.cache.get(key);
    if (!node) {
      this.misses++;
      return void 0;
    }
    if (node.expires && Date.now() > node.expires) {
      this.delete(key);
      this.misses++;
      return void 0;
    }
    this.moveToHead(node);
    this.hits++;
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
        this.cache.delete(this.tail.key);
        this.removeNode(this.tail);
      }
      const effectiveTTL = ttl ?? this.defaultTTL;
      const expires = effectiveTTL ? Date.now() + effectiveTTL : void 0;
      node = new LRUNode(key, value, expires);
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
    return this.cache.delete(key);
  }
  clear() {
    this.cache.clear();
    this.head = null;
    this.tail = null;
    this.hits = 0;
    this.misses = 0;
  }
  get size() {
    return this.cache.size;
  }
  // O(1) move node to head
  moveToHead(node) {
    if (this.head === node) return;
    this.removeNode(node);
    this.addToHead(node);
  }
  // O(1) add node to head
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
  // O(1) remove node from list
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
    node.prev = null;
    node.next = null;
  }
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
   * Get cache statistics
   */
  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.size,
      maxSize: this.maxSize,
      hitRate: total > 0 ? this.hits / total : 0,
      missRate: total > 0 ? this.misses / total : 0
    };
  }
  /**
   * Clean up resources
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = void 0;
    }
    this.clear();
  }
}
class WeakCache {
  constructor() {
    Object.defineProperty(this, "cache", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new WeakMap()
    });
    Object.defineProperty(this, "timerRefs", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: typeof globalThis !== "undefined" && typeof globalThis.WeakRef !== "undefined" ? /* @__PURE__ */ new WeakMap() : void 0
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
    if (existing?.timerId) {
      clearTimeout(existing.timerId);
      this.timerCount--;
    }
    const expires = ttl ? Date.now() + ttl : void 0;
    const item = {
      value,
      expires
    };
    if (ttl && this.timerCount < this.maxTimers && typeof globalThis?.WeakRef !== "undefined" && this.timerRefs) {
      const weakRef = new globalThis.WeakRef(key);
      this.timerRefs.set(key, weakRef);
      item.timerId = setTimeout(() => {
        const keyRef = weakRef.deref();
        if (keyRef) {
          this.delete(keyRef);
        }
        this.timerCount--;
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
    if (item?.timerId) {
      clearTimeout(item.timerId);
      this.timerCount--;
    }
    this.timerRefs?.delete(key);
    return this.cache.delete(key);
  }
  /**
   * Clean up all timers
   */
  destroy() {
    this.timerCount = 0;
  }
}
class StorageCache {
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
    this.storage = storage;
    this.prefix = prefix;
    this.maxSize = maxSize;
  }
  get(key) {
    if (!this.storage) return void 0;
    try {
      const item = this.storage.getItem(this.prefix + key);
      if (!item) return void 0;
      const parsed = JSON.parse(item);
      if (parsed.expires && Date.now() > parsed.expires) {
        this.delete(key);
        return void 0;
      }
      return parsed.value;
    } catch {
      return void 0;
    }
  }
  set(key, value, ttl) {
    if (!this.storage) return;
    try {
      if (this.size >= this.maxSize) {
        this.evictOldest();
      }
      const expires = ttl ? Date.now() + ttl : void 0;
      const item = JSON.stringify({
        value,
        expires,
        timestamp: Date.now()
      });
      this.storage.setItem(this.prefix + key, item);
    } catch (error) {
      console.warn("Failed to cache item:", error);
    }
  }
  has(key) {
    return this.get(key) !== void 0;
  }
  delete(key) {
    if (!this.storage) return false;
    try {
      this.storage.removeItem(this.prefix + key);
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
}
class MultiTierCache {
  constructor(...tiers) {
    Object.defineProperty(this, "tiers", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    this.tiers = tiers;
  }
  get(key) {
    for (let i = 0; i < this.tiers.length; i++) {
      const value = this.tiers[i].get(key);
      if (value !== void 0) {
        for (let j = 0; j < i; j++) {
          this.tiers[j].set(key, value);
        }
        return value;
      }
    }
    return void 0;
  }
  set(key, value, ttl) {
    this.tiers.forEach((tier) => tier.set(key, value, ttl));
  }
  has(key) {
    return this.tiers.some((tier) => tier.has(key));
  }
  delete(key) {
    let deleted = false;
    this.tiers.forEach((tier) => {
      if (tier.delete(key)) {
        deleted = true;
      }
    });
    return deleted;
  }
  clear() {
    this.tiers.forEach((tier) => tier.clear());
  }
  get size() {
    return this.tiers[0]?.size || 0;
  }
}
function createCache(options = {}) {
  const {
    type = "memory",
    maxSize = 1e3,
    ttl,
    storage = "local"
  } = options;
  switch (type) {
    case "storage":
      if (typeof window === "undefined") {
        return new LRUCache(maxSize, ttl);
      }
      return new StorageCache(storage === "session" ? window.sessionStorage : window.localStorage);
    case "multi":
      if (typeof window === "undefined") {
        return new LRUCache(maxSize, ttl);
      }
      return new MultiTierCache(new LRUCache(maxSize / 2, ttl), new StorageCache(window.localStorage));
    case "memory":
    default:
      return new LRUCache(maxSize, ttl);
  }
}

export { LRUCache, MultiTierCache, StorageCache, WeakCache, createCache };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=cache.js.map
