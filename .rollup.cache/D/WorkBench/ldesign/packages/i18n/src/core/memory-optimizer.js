/**
 * @ldesign/i18n - Memory Optimizer
 * 自动内存优化和管理系统
 */
/**
 * 内存优化器
 */
export class MemoryOptimizer {
    constructor(config = {}) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "checkTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "i18n", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastCheck", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "gcCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "strategies", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "isOptimizing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "compressionCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new WeakMap()
        });
        this.config = {
            enabled: true,
            threshold: {
                low: 50, // 50MB
                medium: 100, // 100MB
                high: 200, // 200MB
                critical: 500 // 500MB
            },
            checkInterval: 30000, // 30秒
            strategies: [],
            autoCompression: true,
            aggressiveMode: false,
            ...config
        };
        this.initializeStrategies();
        if (this.config.enabled) {
            this.startMonitoring();
        }
    }
    /**
     * 附加到i18n实例
     */
    attach(i18n) {
        this.i18n = i18n;
    }
    /**
     * 获取内存信息
     */
    getMemoryInfo() {
        if (typeof performance !== 'undefined' && performance.memory) {
            const memory = performance.memory;
            const used = memory.usedJSHeapSize;
            const limit = memory.jsHeapSizeLimit;
            return {
                used,
                limit,
                available: limit - used,
                pressure: this.calculatePressure(used / (1024 * 1024)),
                collections: this.gcCount
            };
        }
        // Node.js 环境
        const proc = globalThis.process;
        if (proc && typeof proc.memoryUsage === 'function') {
            const usage = proc.memoryUsage();
            const used = usage.heapUsed;
            const total = usage.heapTotal;
            return {
                used,
                limit: total,
                available: total - used,
                pressure: this.calculatePressure(used / (1024 * 1024)),
                collections: this.gcCount
            };
        }
        // 默认值
        return {
            used: 0,
            limit: 0,
            available: 0,
            pressure: 'low',
            collections: 0
        };
    }
    /**
     * 计算内存压力级别
     */
    calculatePressure(usedMB) {
        const { threshold } = this.config;
        if (usedMB >= threshold.critical)
            return 'critical';
        if (usedMB >= threshold.high)
            return 'high';
        if (usedMB >= threshold.medium)
            return 'medium';
        return 'low';
    }
    /**
     * 初始化优化策略
     */
    initializeStrategies() {
        // 清理过期缓存
        this.strategies.push({
            name: 'cleanExpiredCache',
            priority: 1,
            condition: (info) => info.pressure !== 'low',
            action: async (optimizer) => {
                if (!optimizer.i18n)
                    return;
                // 清理主缓存中的过期项
                if ('cache' in optimizer.i18n && optimizer.i18n.cache) {
                    const cache = optimizer.i18n.cache;
                    if ('cleanupExpired' in cache) {
                        cache.cleanupExpired();
                    }
                }
            }
        });
        // 压缩大型消息
        this.strategies.push({
            name: 'compressLargeMessages',
            priority: 2,
            condition: (info) => info.pressure === 'medium' && this.config.autoCompression,
            action: async (optimizer) => {
                if (!optimizer.i18n)
                    return;
                // 压缩超过10KB的消息
                const messages = optimizer.i18n.messages;
                if (messages) {
                    for (const [locale, msgs] of messages) {
                        const size = JSON.stringify(msgs).length;
                        if (size > 10240) { // 10KB
                            const compressed = await optimizer.compressObject(msgs);
                            optimizer.compressionCache.set(msgs, compressed);
                        }
                    }
                }
            }
        });
        // 清理未使用的语言包
        this.strategies.push({
            name: 'cleanUnusedLocales',
            priority: 3,
            condition: (info) => info.pressure === 'high',
            action: async (optimizer) => {
                if (!optimizer.i18n)
                    return;
                const currentLocale = optimizer.i18n.getLocale();
                const fallbackLocale = optimizer.i18n.fallbackLocale;
                const keepLocales = new Set([currentLocale, fallbackLocale].flat());
                // 清理除当前和回退语言外的所有语言包
                const availableLocales = optimizer.i18n.getAvailableLocales();
                for (const locale of availableLocales) {
                    if (!keepLocales.has(locale)) {
                        optimizer.i18n.removeLocale(locale);
                    }
                }
            }
        });
        // 缩减缓存大小
        this.strategies.push({
            name: 'reduceCacheSize',
            priority: 4,
            condition: (info) => info.pressure === 'high' || info.pressure === 'critical',
            action: async (optimizer) => {
                if (!optimizer.i18n)
                    return;
                if ('cache' in optimizer.i18n && optimizer.i18n.cache) {
                    const cache = optimizer.i18n.cache;
                    // 清理50%的缓存
                    if ('size' in cache && 'clear' in cache) {
                        const currentSize = cache.size;
                        const targetSize = Math.floor(currentSize * 0.5);
                        // 如果缓存支持部分清理
                        if ('evict' in cache) {
                            cache.evict(currentSize - targetSize);
                        }
                        else {
                            // 否则清空整个缓存
                            cache.clear();
                        }
                    }
                }
            }
        });
        // 强制垃圾回收（仅在Node.js中可用）
        this.strategies.push({
            name: 'forceGarbageCollection',
            priority: 5,
            condition: (info) => info.pressure === 'critical' && this.config.aggressiveMode,
            action: async (optimizer) => {
                if (typeof global !== 'undefined' && global.gc) {
                    global.gc();
                    optimizer.gcCount++;
                }
            }
        });
        // 添加自定义策略
        if (this.config.strategies) {
            this.strategies.push(...this.config.strategies);
        }
        // 按优先级排序
        this.strategies.sort((a, b) => a.priority - b.priority);
    }
    /**
     * 开始监控
     */
    startMonitoring() {
        this.checkTimer = setInterval(() => {
            this.checkAndOptimize();
        }, this.config.checkInterval);
        // In Node.js, avoid keeping the event loop alive
        if (typeof this.checkTimer?.unref === 'function') {
            this.checkTimer.unref();
        }
    }
    /**
     * 检查并优化
     */
    async checkAndOptimize() {
        if (this.isOptimizing)
            return;
        this.isOptimizing = true;
        this.lastCheck = Date.now();
        try {
            const info = this.getMemoryInfo();
            // 执行适用的策略
            for (const strategy of this.strategies) {
                if (strategy.condition(info)) {
                    try {
                        await strategy.action(this);
                        console.log(`[MemoryOptimizer] Executed strategy: ${strategy.name}`);
                    }
                    catch (error) {
                        console.error(`[MemoryOptimizer] Strategy failed: ${strategy.name}`, error);
                    }
                }
            }
            // 触发内存优化事件
            if (this.i18n && 'emit' in this.i18n) {
                this.i18n.emit('memoryOptimized', { info, timestamp: Date.now() });
            }
        }
        finally {
            this.isOptimizing = false;
        }
    }
    /**
     * 压缩对象（简单实现）
     */
    async compressObject(obj) {
        const json = JSON.stringify(obj);
        const encoder = new TextEncoder();
        const data = encoder.encode(json);
        // 简单的RLE压缩
        const compressed = this.simpleCompress(data);
        return compressed.buffer;
    }
    /**
     * 简单压缩算法
     */
    simpleCompress(data) {
        const result = [];
        let i = 0;
        while (i < data.length) {
            let count = 1;
            const current = data[i];
            while (i + count < data.length && data[i + count] === current && count < 255) {
                count++;
            }
            result.push(count, current);
            i += count;
        }
        return new Uint8Array(result);
    }
    /**
     * 手动触发优化
     */
    async optimize() {
        await this.checkAndOptimize();
    }
    /**
     * 获取优化统计
     */
    getStats() {
        const info = this.getMemoryInfo();
        const activeStrategies = this.strategies
            .filter(s => s.condition(info))
            .map(s => s.name);
        return {
            lastCheck: this.lastCheck,
            gcCount: this.gcCount,
            memoryInfo: info,
            activeStrategies
        };
    }
    /**
     * 停止优化器
     */
    stop() {
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
            this.checkTimer = undefined;
        }
    }
    /**
     * 销毁优化器
     */
    destroy() {
        this.stop();
        this.compressionCache = new WeakMap();
        this.i18n = undefined;
    }
}
/**
 * 创建内存优化器
 */
export function createMemoryOptimizer(config) {
    return new MemoryOptimizer(config);
}
/**
 * 内存分析工具
 */
export class MemoryAnalyzer {
    /**
     * 估算对象大小
     */
    static estimateSize(obj) {
        const seen = new WeakSet();
        function sizeof(obj) {
            if (obj === null || obj === undefined)
                return 0;
            const type = typeof obj;
            if (type === 'boolean')
                return 4;
            if (type === 'number')
                return 8;
            if (type === 'string')
                return obj.length * 2;
            if (type === 'symbol')
                return 0;
            if (type === 'object') {
                if (seen.has(obj))
                    return 0;
                seen.add(obj);
                let size = 0;
                if (obj instanceof Date || obj instanceof RegExp) {
                    return 24;
                }
                if (obj instanceof ArrayBuffer) {
                    return obj.byteLength;
                }
                if (Array.isArray(obj)) {
                    size = 24; // Array overhead
                    for (const item of obj) {
                        size += sizeof(item);
                    }
                }
                else if (obj instanceof Map) {
                    size = 24; // Map overhead
                    for (const [key, value] of obj) {
                        size += sizeof(key) + sizeof(value);
                    }
                }
                else if (obj instanceof Set) {
                    size = 24; // Set overhead
                    for (const item of obj) {
                        size += sizeof(item);
                    }
                }
                else {
                    size = 24; // Object overhead
                    for (const key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            size += sizeof(key) + sizeof(obj[key]);
                        }
                    }
                }
                return size;
            }
            return 0;
        }
        return sizeof(obj);
    }
    /**
     * 分析内存使用分布
     */
    static analyzeDistribution(i18n) {
        let messages = 0;
        let cache = 0;
        let other = 0;
        // 分析消息大小
        if ('messages' in i18n) {
            messages = this.estimateSize(i18n.messages);
        }
        // 分析缓存大小
        if ('cache' in i18n) {
            cache = this.estimateSize(i18n.cache);
        }
        // 分析其他部分
        other = this.estimateSize(i18n) - messages - cache;
        return {
            messages,
            cache,
            other,
            total: messages + cache + other
        };
    }
}
//# sourceMappingURL=memory-optimizer.js.map