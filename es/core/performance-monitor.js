/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class PerformanceMonitor {
  constructor(config = {}) {
    Object.defineProperty(this, "config", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "metrics", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "events", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "observers", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "timers", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "reportTimer", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "memoryCheckTimer", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "rafId", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "lastFrameTime", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    Object.defineProperty(this, "frameCount", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    Object.defineProperty(this, "jankCount", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    Object.defineProperty(this, "isDestroyed", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    this.config = {
      enabled: true,
      sampleRate: 1,
      reportInterval: 6e4,
      // 1 minute
      slowThreshold: 100,
      // 100ms
      enableProfiling: true,
      enableMemoryTracking: true,
      enableNetworkTracking: true,
      maxEvents: 1e3,
      alertThresholds: {
        translationTime: 50,
        cacheHitRate: 0.8,
        memoryUsage: 100 * 1024 * 1024,
        // 100MB
        fps: 30
      },
      ...config
    };
    this.metrics = this.initMetrics();
    if (this.config?.enabled) {
      this.start();
    }
  }
  /**
   * 开始监控
   */
  start() {
    this.initializeObservers();
    this.startReporting();
    this.startFrameMonitoring();
  }
  /**
   * 停止监控
   */
  stop() {
    this.isDestroyed = true;
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = void 0;
    }
    if (this.memoryCheckTimer) {
      clearInterval(this.memoryCheckTimer);
      this.memoryCheckTimer = void 0;
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = void 0;
    }
    this.timers.clear();
    this.events = [];
  }
  /**
   * 记录翻译性能
   */
  recordTranslation(key, startTime) {
    if (!this.shouldSample()) return;
    const duration = performance.now() - startTime;
    this.metrics.translationCount++;
    this.metrics.averageTranslationTime = (this.metrics.averageTranslationTime * (this.metrics.translationCount - 1) + duration) / this.metrics.translationCount;
    if (!this.metrics.slowestTranslation || duration > this.metrics.slowestTranslation.time) {
      this.metrics.slowestTranslation = {
        key,
        time: duration
      };
    }
    if (!this.metrics.fastestTranslation || duration < this.metrics.fastestTranslation.time) {
      this.metrics.fastestTranslation = {
        key,
        time: duration
      };
    }
    if (duration > this.config?.slowThreshold) {
      this.addEvent({
        type: "translation",
        timestamp: Date.now(),
        duration,
        details: {
          key,
          slow: true
        }
      });
      console.warn(`[PerformanceMonitor] Slow translation detected: "${key}" took ${duration.toFixed(2)}ms`);
    }
    this.checkAlerts("translation", duration);
  }
  /**
   * 记录缓存命中
   */
  recordCacheHit() {
    this.metrics.cacheHits++;
    this.updateCacheHitRate();
  }
  /**
   * 记录缓存未命中
   */
  recordCacheMiss() {
    this.metrics.cacheMisses++;
    this.updateCacheHitRate();
  }
  /**
   * 记录加载性能
   */
  recordLoad(locale, size, duration) {
    this.metrics.loadedLocales++;
    this.metrics.loadTime.set(locale, duration);
    this.metrics.totalLoadSize += size;
    const times = Array.from(this.metrics.loadTime.values());
    this.metrics.averageLoadTime = times.reduce((a, b) => a + b, 0) / times.length;
    this.addEvent({
      type: "load",
      timestamp: Date.now(),
      duration,
      details: {
        locale,
        size
      }
    });
  }
  /**
   * 记录内存使用
   */
  recordMemoryUsage(usage) {
    this.metrics.memoryUsage = usage;
    if (usage > this.metrics.peakMemoryUsage) {
      this.metrics.peakMemoryUsage = usage;
    }
    this.checkAlerts("memory", usage);
  }
  /**
   * 开始计时
   */
  startTimer(label) {
    this.timers.set(label, performance.now());
  }
  /**
   * 结束计时
   */
  endTimer(label) {
    const startTime = this.timers.get(label);
    if (!startTime) return 0;
    const duration = performance.now() - startTime;
    this.timers.delete(label);
    return duration;
  }
  /**
   * 获取性能指标
   */
  getMetrics() {
    return {
      ...this.metrics
    };
  }
  /**
   * 获取性能报告
   */
  getReport() {
    return {
      metrics: this.getMetrics(),
      events: [...this.events],
      recommendations: this.generateRecommendations(),
      timestamp: /* @__PURE__ */ new Date()
    };
  }
  /**
   * 生成优化建议
   */
  generateRecommendations() {
    const recommendations = [];
    if (this.metrics.averageTranslationTime > 10) {
      recommendations.push("Consider enabling more aggressive caching to reduce translation time");
    }
    if (this.metrics.cacheHitRate < 0.8) {
      recommendations.push("Cache hit rate is low. Consider increasing cache size or TTL");
    }
    if (this.metrics.memoryUsage > 50 * 1024 * 1024) {
      recommendations.push("High memory usage detected. Enable compression for large translations");
    }
    if (this.metrics.averageLoadTime > 1e3) {
      recommendations.push("Slow loading detected. Consider using CDN or enabling lazy loading");
    }
    if (this.metrics.fps < 30) {
      recommendations.push("Low FPS detected. Reduce translation frequency or use debouncing");
    }
    return recommendations;
  }
  /**
   * 导出性能数据
   */
  exportData() {
    const report = this.getReport();
    return JSON.stringify(report, null, 2);
  }
  /**
   * 重置指标
   */
  reset() {
    this.metrics = this.initMetrics();
    this.events = [];
  }
  /**
   * 初始化指标
   */
  initMetrics() {
    return {
      translationCount: 0,
      averageTranslationTime: 0,
      slowestTranslation: {
        key: "",
        time: 0
      },
      fastestTranslation: {
        key: "",
        time: Infinity
      },
      cacheHitRate: 0,
      cacheSize: 0,
      cacheMisses: 0,
      cacheHits: 0,
      loadedLocales: 0,
      loadTime: /* @__PURE__ */ new Map(),
      averageLoadTime: 0,
      totalLoadSize: 0,
      memoryUsage: 0,
      peakMemoryUsage: 0,
      gcCount: 0,
      memoryLeaks: 0,
      fps: 60,
      jank: 0,
      renderTime: 0,
      scriptTime: 0
    };
  }
  /**
   * 初始化观察器
   */
  initializeObservers() {
    if (typeof PerformanceObserver !== "undefined") {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === "navigation") {
              const nav = entry;
            }
          }
        });
        navigationObserver.observe({
          entryTypes: ["navigation"]
        });
        this.observers.set("navigation", navigationObserver);
      } catch (e) {
        console.warn("[PerformanceMonitor] Navigation observer not supported");
      }
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.includes(".json") || entry.name.includes("i18n")) {
              const resource = entry;
              this.recordLoad(entry.name, resource.encodedBodySize || 0, resource.responseEnd - resource.startTime);
            }
          }
        });
        resourceObserver.observe({
          entryTypes: ["resource"]
        });
        this.observers.set("resource", resourceObserver);
      } catch (e) {
        console.warn("[PerformanceMonitor] Resource observer not supported");
      }
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.jankCount++;
            this.addEvent({
              type: "render",
              timestamp: Date.now(),
              duration: entry.duration,
              details: {
                type: "longTask"
              }
            });
          }
        });
        longTaskObserver.observe({
          entryTypes: ["longtask"]
        });
        this.observers.set("longtask", longTaskObserver);
      } catch (e) {
        console.warn("[PerformanceMonitor] Long task observer not supported");
      }
    }
    if (this.config?.enableMemoryTracking) {
      this.startMemoryMonitoring();
    }
  }
  /**
   * 开始内存监控
   */
  startMemoryMonitoring() {
    const checkMemory = () => {
      if (this.isDestroyed) return;
      if (typeof performance !== "undefined" && performance.memory) {
        const memory = performance.memory;
        this.recordMemoryUsage(memory.usedJSHeapSize);
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          console.warn("[PerformanceMonitor] Potential memory leak detected");
          this.metrics.memoryLeaks++;
        }
      }
    };
    this.memoryCheckTimer = setInterval(checkMemory, 1e4);
    if (typeof this.memoryCheckTimer?.unref === "function") {
      this.memoryCheckTimer.unref();
    }
  }
  /**
   * 开始帧率监控
   */
  startFrameMonitoring() {
    const measureFrame = (timestamp) => {
      if (this.isDestroyed) return;
      if (this.lastFrameTime) {
        const delta = timestamp - this.lastFrameTime;
        if (delta > 33) {
          this.jankCount++;
        }
        this.frameCount++;
        if (this.frameCount >= 60) {
          this.metrics.fps = 1e3 / (delta / this.frameCount);
          this.metrics.jank = this.jankCount;
          this.frameCount = 0;
          this.jankCount = 0;
        }
      }
      this.lastFrameTime = timestamp;
      if (!this.isDestroyed) {
        this.rafId = requestAnimationFrame(measureFrame);
      }
    };
    this.rafId = requestAnimationFrame(measureFrame);
  }
  /**
   * 开始定期报告
   */
  startReporting() {
    this.reportTimer = setInterval(() => {
      if (this.isDestroyed) {
        clearInterval(this.reportTimer);
        return;
      }
      const report = this.getReport();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("i18n:performance", {
          detail: report
        }));
      }
    }, this.config?.reportInterval);
    if (typeof this.reportTimer?.unref === "function") {
      this.reportTimer.unref();
    }
  }
  /**
   * 更新缓存命中率
   */
  updateCacheHitRate() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    if (total > 0) {
      this.metrics.cacheHitRate = this.metrics.cacheHits / total;
    }
  }
  /**
   * 添加事件
   */
  addEvent(event) {
    if (this.events.length >= this.config?.maxEvents) {
      this.events.shift();
    }
    this.events.push(event);
  }
  /**
   * 检查告警
   */
  checkAlerts(type, value) {
    const thresholds = this.config?.alertThresholds;
    switch (type) {
      case "translation":
        if (value > thresholds.translationTime) {
          console.warn(`[PerformanceMonitor] Translation time exceeded threshold: ${value}ms`);
        }
        break;
      case "memory":
        if (value > thresholds.memoryUsage) {
          console.warn(`[PerformanceMonitor] Memory usage exceeded threshold: ${(value / 1024 / 1024).toFixed(2)}MB`);
        }
        break;
    }
  }
  /**
   * 是否应该采样
   */
  shouldSample() {
    return Math.random() < this.config?.sampleRate;
  }
}
function createPerformanceMonitor(config) {
  return new PerformanceMonitor(config);
}
function measure(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = async function(...args) {
    const monitor = this.performanceMonitor;
    if (monitor) {
      monitor.startTimer(propertyKey);
    }
    const result = await originalMethod.apply(this, args);
    if (monitor) {
      monitor.endTimer(propertyKey);
    }
    return result;
  };
  return descriptor;
}

export { PerformanceMonitor, createPerformanceMonitor, measure };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=performance-monitor.js.map
