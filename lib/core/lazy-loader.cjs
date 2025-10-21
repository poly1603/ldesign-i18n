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

class LazyLoader {
  constructor(config = {}) {
    Object.defineProperty(this, "config", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "loadStates", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "cache", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "preloadQueue", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Set()
    });
    Object.defineProperty(this, "loadingPool", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "observer", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "idleCallback", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "eventListeners", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "MAX_CACHE_SIZE", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 50
    });
    Object.defineProperty(this, "MAX_LOAD_STATES", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 100
    });
    this.config = {
      preloadStrategy: "idle",
      preloadDelay: 2e3,
      cacheStrategy: "memory",
      chunkStrategy: "namespace",
      concurrent: 3,
      timeout: 3e4,
      retry: 3,
      compression: true,
      compressionAlgorithm: "lz-string",
      ...config
    };
    this.initializePreloadStrategy();
  }
  /**
   * 加载语言包
   */
  async load(locale, namespace) {
    const key = this.getCacheKey(locale, namespace);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    if (this.loadingPool.has(key)) {
      return this.loadingPool.get(key);
    }
    const loadPromise = this.performLoad(locale, namespace);
    this.loadingPool.set(key, loadPromise);
    try {
      const messages = await loadPromise;
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey !== void 0) {
          this.cache.delete(firstKey);
        }
      }
      this.cache.set(key, messages);
      this.updateLoadState(key, "loaded", void 0, messages);
      return messages;
    } catch (error) {
      this.updateLoadState(key, "error", error);
      throw error;
    } finally {
      this.loadingPool.delete(key);
    }
  }
  /**
   * 预加载语言包
   */
  async preload(locales, namespaces) {
    const tasks = [];
    for (const locale of locales) {
      if (namespaces) {
        for (const namespace of namespaces) {
          tasks.push(this.load(locale, namespace));
        }
      } else {
        tasks.push(this.load(locale));
      }
    }
    await this.executeWithConcurrency(tasks, Number(this.config?.concurrent ?? 3));
  }
  /**
   * 智能预加载
   */
  smartPreload(patterns) {
    if (this.config?.preloadStrategy === "none") return;
    patterns.forEach((pattern) => {
      this.preloadQueue.add(pattern);
    });
    switch (this.config?.preloadStrategy) {
      case "idle":
        this.preloadOnIdle();
        break;
      case "prefetch":
        this.preloadWithPrefetch();
        break;
      case "viewport":
        this.preloadOnViewport();
        break;
    }
  }
  /**
   * 加载路由级语言包
   */
  async loadForRoute(route, locale) {
    const namespace = this.getNamespaceForRoute(route);
    return this.load(locale, namespace);
  }
  /**
   * 加载组件级语言包
   */
  async loadForComponent(component, locale) {
    const namespace = `components.${component}`;
    return this.load(locale, namespace);
  }
  /**
   * 清理缓存
   */
  clearCache(locale, namespace) {
    if (locale) {
      const key = this.getCacheKey(locale, namespace);
      this.cache.delete(key);
      this.loadStates.delete(key);
    } else {
      this.cache.clear();
      this.loadStates.clear();
    }
  }
  /**
   * 获取加载统计
   */
  getStats() {
    let totalSize = 0;
    let loaded = 0;
    this.loadStates.forEach((state) => {
      if (state.status === "loaded") {
        loaded++;
        totalSize += state.size || 0;
      }
    });
    return {
      loaded,
      cached: this.cache.size,
      totalSize,
      states: this.loadStates
    };
  }
  /**
   * 执行实际加载
   */
  async performLoad(locale, namespace) {
    this.updateLoadState(this.getCacheKey(locale, namespace), "loading");
    let messages;
    if (this.config?.loader) {
      messages = await this.withRetry(() => this.config?.loader(locale, namespace), Number(this.config?.retry ?? 3));
    } else if (this.config?.baseUrl) {
      messages = await this.loadFromUrl(locale, namespace);
    } else {
      throw new Error("No loader configured");
    }
    if (this.config?.compression) {
      messages = await this.decompress(messages);
    }
    this.estimateSize(messages);
    this.updateLoadState(this.getCacheKey(locale, namespace), "loaded", void 0);
    return messages;
  }
  /**
   * 从URL加载
   */
  async loadFromUrl(locale, namespace) {
    const url = this.buildUrl(locale, namespace);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate, br"
      },
      signal: AbortSignal.timeout(this.config?.timeout ?? 3e4)
    });
    if (!response.ok) {
      throw new Error(`Failed to load: ${response.statusText}`);
    }
    return response.json();
  }
  /**
   * 构建URL
   */
  buildUrl(locale, namespace) {
    const base = this.config?.baseUrl.replace(/\/$/, "");
    if (namespace) {
      return `${base}/${locale}/${namespace}.json`;
    }
    return `${base}/${locale}.json`;
  }
  /**
   * 带重试的执行
   */
  async withRetry(fn, retries) {
    let lastError;
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < retries) {
          await this.delay(2 ** i * 1e3);
        }
      }
    }
    throw lastError;
  }
  /**
   * 并发控制执行
   */
  async executeWithConcurrency(tasks, concurrent) {
    const results = [];
    const executing = [];
    for (const task of tasks) {
      const promise = task.then((result) => {
        results.push(result);
      });
      executing.push(promise);
      if (executing.length >= concurrent) {
        await Promise.race(executing);
        executing.splice(executing.findIndex((p) => p === promise), 1);
      }
    }
    await Promise.all(executing);
    return results;
  }
  /**
   * 空闲时预加载
   */
  preloadOnIdle() {
    if ("requestIdleCallback" in window) {
      this.idleCallback = window.requestIdleCallback(() => this.processPreloadQueue(), {
        timeout: this.config?.preloadDelay
      });
    } else {
      setTimeout(() => this.processPreloadQueue(), this.config?.preloadDelay);
    }
  }
  /**
   * 使用Prefetch预加载
   */
  preloadWithPrefetch() {
    this.preloadQueue.forEach((pattern) => {
      const [locale, namespace] = pattern.split(":");
      const url = this.buildUrl(locale, namespace);
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = url;
      link.as = "fetch";
      document.head.appendChild(link);
    });
  }
  /**
   * 视口内预加载
   */
  preloadOnViewport() {
    if (!this.observer) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const locale = element.dataset.i18nLocale;
            const namespace = element.dataset.i18nNamespace;
            if (locale) {
              this.load(locale, namespace).catch(console.error);
            }
          }
        });
      }, {
        rootMargin: "50px"
      });
    }
    document.querySelectorAll("[data-i18n-preload]").forEach((element) => {
      if (this.observer) {
        this.observer.observe(element);
      }
    });
  }
  /**
   * 处理预加载队列
   */
  async processPreloadQueue() {
    const tasks = Array.from(this.preloadQueue).map((pattern) => {
      const [locale, namespace] = pattern.split(":");
      return this.load(locale, namespace);
    });
    await this.executeWithConcurrency(tasks, Number(this.config?.concurrent ?? 3));
    this.preloadQueue.clear();
  }
  /**
   * 解压缩
   */
  async decompress(data) {
    if (this.config?.compressionAlgorithm === "lz-string" && typeof data === "string") {
      return JSON.parse(this.lzDecompress(data));
    }
    return data;
  }
  /**
   * LZ-string解压缩
   */
  lzDecompress(compressed) {
    return compressed;
  }
  /**
   * 更新加载状态
   */
  updateLoadState(key, status, error, messages) {
    if (this.loadStates.size >= this.MAX_LOAD_STATES) {
      const firstKey = this.loadStates.keys().next().value;
      if (firstKey !== void 0) {
        this.loadStates.delete(firstKey);
      }
    }
    const [locale, namespace] = key.split(":");
    this.loadStates.set(key, {
      locale,
      namespace,
      status,
      error,
      timestamp: Date.now(),
      size: messages ? this.estimateSize(messages) : void 0
    });
  }
  /**
   * 估算大小
   */
  estimateSize(obj) {
    return JSON.stringify(obj).length;
  }
  /**
   * 格式化大小
   */
  formatSize(bytes) {
    const units = ["B", "KB", "MB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
  /**
   * 获取路由对应的命名空间
   */
  getNamespaceForRoute(route) {
    return `routes.${route.replace(/\//g, ".").replace(/^\./, "")}`;
  }
  /**
   * 获取缓存键
   */
  getCacheKey(locale, namespace) {
    return namespace ? `${locale}:${namespace}` : locale;
  }
  /**
   * 延迟
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * 初始化预加载策略
   */
  initializePreloadStrategy() {
    if (typeof window !== "undefined") {
      const handler = () => {
        const locale = this.getCurrentLocale();
        const route = window.location.pathname;
        this.loadForRoute(route, locale).catch(console.error);
      };
      window.addEventListener("popstate", handler);
      this.eventListeners.push({
        element: window,
        event: "popstate",
        handler
      });
    }
  }
  /**
   * 获取当前语言
   */
  getCurrentLocale() {
    return document.documentElement.lang || "en";
  }
  /**
   * 清理资源
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = void 0;
    }
    if (this.idleCallback) {
      window.cancelIdleCallback(this.idleCallback);
      this.idleCallback = void 0;
    }
    this.eventListeners.forEach(({
      element,
      event,
      handler
    }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
    this.cache.clear();
    this.loadStates.clear();
    this.loadingPool.clear();
    this.preloadQueue.clear();
  }
}
function createLazyLoader(config) {
  return new LazyLoader(config);
}

exports.LazyLoader = LazyLoader;
exports.createLazyLoader = createLazyLoader;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=lazy-loader.cjs.map
