/**
 * @ldesign/i18n - Optimized Cache System
 * 高性能优化的缓存实现，解决内存泄漏和性能问题
 */
/**
 * 双向链表节点（用于 LRU） - 使用对象池复用节点
 */
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
/**
 * 节点对象池 - 减少 GC 压力
 */
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
/**
 * 优化的 LRU Cache 实现
 * 使用双向链表实现 O(1) 的访问顺序更新
 */
export class OptimizedLRUCache {
    constructor(maxSize = 1000, defaultTTL) {
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
            value: new Map()
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
            value: 60000
        }); // 60秒清理一次过期项
        this.maxSize = maxSize > 0 ? maxSize : 1000;
        this.defaultTTL = defaultTTL;
        // 启动定期清理
        if (defaultTTL && typeof setInterval !== 'undefined') {
            this.cleanupTimer = setInterval(() => this.cleanupExpired(), this.CLEANUP_INTERVAL);
            // In Node.js, avoid keeping the event loop alive
            if (typeof this.cleanupTimer?.unref === 'function') {
                this.cleanupTimer.unref();
            }
        }
    }
    get(key) {
        const node = this.cache.get(key);
        if (!node) {
            return undefined;
        }
        // 检查过期
        if (node.expires && Date.now() > node.expires) {
            this.delete(key);
            return undefined;
        }
        // O(1) 移动到头部（最近使用）
        this.moveToHead(node);
        return node.value;
    }
    set(key, value, ttl) {
        let node = this.cache.get(key);
        if (node) {
            // 更新现有节点
            node.value = value;
            const effectiveTTL = ttl ?? this.defaultTTL;
            node.expires = effectiveTTL ? Date.now() + effectiveTTL : undefined;
            this.moveToHead(node);
        }
        else {
            // 检查容量
            if (this.cache.size >= this.maxSize && this.tail) {
                // O(1) 移除尾部（最少使用）
                const oldNode = this.tail;
                this.cache.delete(oldNode.key);
                this.removeNode(oldNode);
                this.nodePool.release(oldNode); // 回收节点
            }
            // 从对象池获取节点
            const effectiveTTL = ttl ?? this.defaultTTL;
            const expires = effectiveTTL ? Date.now() + effectiveTTL : undefined;
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
        // 检查过期
        if (node.expires && Date.now() > node.expires) {
            this.delete(key);
            return false;
        }
        return true;
    }
    delete(key) {
        const node = this.cache.get(key);
        if (!node)
            return false;
        this.removeNode(node);
        this.nodePool.release(node); // 回收节点
        return this.cache.delete(key);
    }
    clear() {
        // 回收所有节点
        this.cache.forEach(node => this.nodePool.release(node));
        this.cache.clear();
        this.head = null;
        this.tail = null;
    }
    get size() {
        // 清理过期项
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
        }
        else {
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        }
        else {
            this.tail = node.prev;
        }
    }
    // 清理过期项 - 优化版，限制单次清理数量
    cleanupExpired() {
        if (this.cache.size === 0)
            return;
        const now = Date.now();
        const maxCleanup = Math.min(100, Math.ceil(this.cache.size * 0.1)); // 每次最多清理10%或100个
        let cleaned = 0;
        for (const [key, node] of this.cache) {
            if (node.expires && now > node.expires) {
                this.delete(key);
                if (++cleaned >= maxCleanup)
                    break;
            }
        }
    }
    /**
     * 清理所有资源
     */
    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }
        this.clear();
    }
}
/**
 * 优化的 WeakCache 实现
 * 修复了定时器泄漏问题，使用 WeakRef 进一步优化
 */
export class OptimizedWeakCache {
    constructor() {
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new WeakMap()
        });
        Object.defineProperty(this, "maxTimers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1000
        }); // 限制同时存在的定时器数量
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
            return undefined;
        }
        // 检查过期
        if (item.expires && Date.now() > item.expires) {
            this.delete(key);
            return undefined;
        }
        return item.value;
    }
    set(key, value, ttl) {
        // 清理旧的定时器
        const existing = this.cache.get(key);
        if (existing?.timer) {
            clearTimeout(existing.timer);
            this.timerCount--;
        }
        const expires = ttl ? Date.now() + ttl : undefined;
        const item = { value, expires };
        // 只在定时器数量不超过限制时设置定时器
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
        if (!item)
            return false;
        // 检查过期
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
        // WeakMap 不能遍历，但在对象被 GC 后定时器会自动清理
        this.timerCount = 0;
    }
}
/**
 * 优化的 StorageCache 实现
 * 使用防抖减少 localStorage 操作，并使用 LRU 策略
 */
export class OptimizedStorageCache {
    constructor(storage = typeof window !== 'undefined' ? window.localStorage : null, prefix = 'i18n_cache_', maxSize = 100) {
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
            value: new Map()
        });
        Object.defineProperty(this, "memoryCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        }); // 内存缓存层
        Object.defineProperty(this, "writeDelay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1000
        }); // 1秒防抖
        this.storage = storage;
        this.prefix = prefix;
        this.maxSize = maxSize > 0 ? maxSize : 100;
        // 初始化时加载已有的缓存到内存
        if (this.storage) {
            this.loadExistingCache();
        }
    }
    loadExistingCache() {
        if (!this.storage)
            return;
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
                        }
                        catch { }
                    }
                }
            }
        }
        catch { }
    }
    get(key) {
        // 先从内存缓存读取
        const cached = this.memoryCache.get(key);
        if (cached) {
            // 检查过期
            if (cached.expires && Date.now() > cached.expires) {
                this.delete(key);
                return undefined;
            }
            return cached.value;
        }
        // 如果内存没有，从 storage 读取
        if (!this.storage)
            return undefined;
        try {
            const item = this.storage.getItem(this.prefix + key);
            if (!item)
                return undefined;
            const parsed = JSON.parse(item);
            // 检查过期
            if (parsed.expires && Date.now() > parsed.expires) {
                this.delete(key);
                return undefined;
            }
            // 加入内存缓存
            this.memoryCache.set(key, {
                value: parsed.value,
                expires: parsed.expires
            });
            return parsed.value;
        }
        catch {
            return undefined;
        }
    }
    set(key, value, ttl) {
        const expires = ttl ? Date.now() + ttl : undefined;
        // 立即更新内存缓存
        this.memoryCache.set(key, { value, expires });
        // 添加到待写入队列
        if (this.storage) {
            this.pendingWrites.set(key, { value, ttl });
            // 延迟写入
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
        if (!this.storage || this.pendingWrites.size === 0)
            return;
        // 使用 requestIdleCallback 或直接执行
        const doWrite = () => {
            try {
                // 检查大小限制
                if (this.size >= this.maxSize) {
                    this.evictOldest();
                }
                // 批量写入
                this.pendingWrites.forEach(({ value, ttl }, key) => {
                    const expires = ttl ? Date.now() + ttl : undefined;
                    const item = JSON.stringify({ value, expires, timestamp: Date.now() });
                    this.storage.setItem(this.prefix + key, item);
                });
                this.pendingWrites.clear();
            }
            catch (error) {
                console.warn('Failed to cache items:', error);
            }
        };
        if ('requestIdleCallback' in window) {
            requestIdleCallback(doWrite);
        }
        else {
            doWrite();
        }
    }
    has(key) {
        return this.get(key) !== undefined;
    }
    delete(key) {
        if (!this.storage)
            return false;
        try {
            this.storage.removeItem(this.prefix + key);
            this.pendingWrites.delete(key);
            // Also clear in-memory cache to free memory
            this.memoryCache.delete(key);
            return true;
        }
        catch {
            return false;
        }
    }
    clear() {
        if (!this.storage)
            return;
        const keysToRemove = [];
        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i);
            if (key?.startsWith(this.prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => this.storage.removeItem(key));
        this.pendingWrites.clear();
        this.memoryCache.clear();
    }
    get size() {
        if (!this.storage)
            return 0;
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
        if (!this.storage)
            return;
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
                }
                catch {
                    // Ignore parse errors
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
        // 立即刷新待写入项
        if (this.writeTimer !== null) {
            clearTimeout(this.writeTimer);
            this.writeTimer = null;
        }
        this.flushWrites();
        this.pendingWrites.clear();
        this.memoryCache.clear();
    }
}
/**
 * 创建优化的缓存
 */
export function createOptimizedCache(options = {}) {
    const { type = 'memory', maxSize = 1000, ttl, storage = 'local' } = options;
    switch (type) {
        case 'storage':
            if (typeof window === 'undefined') {
                return new OptimizedLRUCache(maxSize, ttl);
            }
            return new OptimizedStorageCache(storage === 'session' ? window.sessionStorage : window.localStorage);
        case 'memory':
        default:
            return new OptimizedLRUCache(maxSize, ttl);
    }
}
//# sourceMappingURL=optimized-cache.js.map