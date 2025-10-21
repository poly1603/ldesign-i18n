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

class MemoryOptimizer {
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
      value: /* @__PURE__ */ new WeakMap()
    });
    this.config = {
      enabled: true,
      threshold: {
        low: 50,
        // 50MB
        medium: 100,
        // 100MB
        high: 200,
        // 200MB
        critical: 500
        // 500MB
      },
      checkInterval: 3e4,
      // 30秒
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
    if (typeof performance !== "undefined" && performance.memory) {
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
    const proc = globalThis.process;
    if (proc && typeof proc.memoryUsage === "function") {
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
    return {
      used: 0,
      limit: 0,
      available: 0,
      pressure: "low",
      collections: 0
    };
  }
  /**
   * 计算内存压力级别
   */
  calculatePressure(usedMB) {
    const {
      threshold
    } = this.config;
    if (usedMB >= threshold.critical) return "critical";
    if (usedMB >= threshold.high) return "high";
    if (usedMB >= threshold.medium) return "medium";
    return "low";
  }
  /**
   * 初始化优化策略
   */
  initializeStrategies() {
    this.strategies.push({
      name: "cleanExpiredCache",
      priority: 1,
      condition: (info) => info.pressure !== "low",
      action: async (optimizer) => {
        if (!optimizer.i18n) return;
        if ("cache" in optimizer.i18n && optimizer.i18n.cache) {
          const cache = optimizer.i18n.cache;
          if ("cleanupExpired" in cache) {
            cache.cleanupExpired();
          }
        }
      }
    });
    this.strategies.push({
      name: "compressLargeMessages",
      priority: 2,
      condition: (info) => info.pressure === "medium" && this.config.autoCompression,
      action: async (optimizer) => {
        if (!optimizer.i18n) return;
        const messages = optimizer.i18n.messages;
        if (messages) {
          for (const [locale, msgs] of messages) {
            const size = JSON.stringify(msgs).length;
            if (size > 10240) {
              const compressed = await optimizer.compressObject(msgs);
              optimizer.compressionCache.set(msgs, compressed);
            }
          }
        }
      }
    });
    this.strategies.push({
      name: "cleanUnusedLocales",
      priority: 3,
      condition: (info) => info.pressure === "high",
      action: async (optimizer) => {
        if (!optimizer.i18n) return;
        const currentLocale = optimizer.i18n.getLocale();
        const fallbackLocale = optimizer.i18n.fallbackLocale;
        const keepLocales = new Set([currentLocale, fallbackLocale].flat());
        const availableLocales = optimizer.i18n.getAvailableLocales();
        for (const locale of availableLocales) {
          if (!keepLocales.has(locale)) {
            optimizer.i18n.removeLocale(locale);
          }
        }
      }
    });
    this.strategies.push({
      name: "reduceCacheSize",
      priority: 4,
      condition: (info) => info.pressure === "high" || info.pressure === "critical",
      action: async (optimizer) => {
        if (!optimizer.i18n) return;
        if ("cache" in optimizer.i18n && optimizer.i18n.cache) {
          const cache = optimizer.i18n.cache;
          if ("size" in cache && "clear" in cache) {
            const currentSize = cache.size;
            const targetSize = Math.floor(currentSize * 0.5);
            if ("evict" in cache) {
              cache.evict(currentSize - targetSize);
            } else {
              cache.clear();
            }
          }
        }
      }
    });
    this.strategies.push({
      name: "forceGarbageCollection",
      priority: 5,
      condition: (info) => info.pressure === "critical" && this.config.aggressiveMode,
      action: async (optimizer) => {
        if (typeof global !== "undefined" && global.gc) {
          global.gc();
          optimizer.gcCount++;
        }
      }
    });
    if (this.config.strategies) {
      this.strategies.push(...this.config.strategies);
    }
    this.strategies.sort((a, b) => a.priority - b.priority);
  }
  /**
   * 开始监控
   */
  startMonitoring() {
    this.checkTimer = setInterval(() => {
      this.checkAndOptimize();
    }, this.config.checkInterval);
    if (typeof this.checkTimer?.unref === "function") {
      this.checkTimer.unref();
    }
  }
  /**
   * 检查并优化
   */
  async checkAndOptimize() {
    if (this.isOptimizing) return;
    this.isOptimizing = true;
    this.lastCheck = Date.now();
    try {
      const info = this.getMemoryInfo();
      for (const strategy of this.strategies) {
        if (strategy.condition(info)) {
          try {
            await strategy.action(this);
            console.log(`[MemoryOptimizer] Executed strategy: ${strategy.name}`);
          } catch (error) {
            console.error(`[MemoryOptimizer] Strategy failed: ${strategy.name}`, error);
          }
        }
      }
      if (this.i18n && "emit" in this.i18n) {
        this.i18n.emit("memoryOptimized", {
          info,
          timestamp: Date.now()
        });
      }
    } finally {
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
    const activeStrategies = this.strategies.filter((s) => s.condition(info)).map((s) => s.name);
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
      this.checkTimer = void 0;
    }
  }
  /**
   * 销毁优化器
   */
  destroy() {
    this.stop();
    this.compressionCache = /* @__PURE__ */ new WeakMap();
    this.i18n = void 0;
  }
}
function createMemoryOptimizer(config) {
  return new MemoryOptimizer(config);
}
class MemoryAnalyzer {
  /**
   * 估算对象大小
   */
  static estimateSize(obj) {
    const seen = /* @__PURE__ */ new WeakSet();
    function sizeof(obj2) {
      if (obj2 === null || obj2 === void 0) return 0;
      const type = typeof obj2;
      if (type === "boolean") return 4;
      if (type === "number") return 8;
      if (type === "string") return obj2.length * 2;
      if (type === "symbol") return 0;
      if (type === "object") {
        if (seen.has(obj2)) return 0;
        seen.add(obj2);
        let size = 0;
        if (obj2 instanceof Date || obj2 instanceof RegExp) {
          return 24;
        }
        if (obj2 instanceof ArrayBuffer) {
          return obj2.byteLength;
        }
        if (Array.isArray(obj2)) {
          size = 24;
          for (const item of obj2) {
            size += sizeof(item);
          }
        } else if (obj2 instanceof Map) {
          size = 24;
          for (const [key, value] of obj2) {
            size += sizeof(key) + sizeof(value);
          }
        } else if (obj2 instanceof Set) {
          size = 24;
          for (const item of obj2) {
            size += sizeof(item);
          }
        } else {
          size = 24;
          for (const key in obj2) {
            if (obj2.hasOwnProperty(key)) {
              size += sizeof(key) + sizeof(obj2[key]);
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
    if ("messages" in i18n) {
      messages = this.estimateSize(i18n.messages);
    }
    if ("cache" in i18n) {
      cache = this.estimateSize(i18n.cache);
    }
    other = this.estimateSize(i18n) - messages - cache;
    return {
      messages,
      cache,
      other,
      total: messages + cache + other
    };
  }
}

exports.MemoryAnalyzer = MemoryAnalyzer;
exports.MemoryOptimizer = MemoryOptimizer;
exports.createMemoryOptimizer = createMemoryOptimizer;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=memory-optimizer.cjs.map
