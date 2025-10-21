/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { EventEmitter, getNestedValue, isString, isPlainObject, deepMerge, warn, getBrowserLanguage } from '../utils/helpers.js';
import { LRUCache, createCache } from './cache.js';
import { InterpolationEngine } from './interpolation.js';
import { PluralizationEngine } from './pluralization.js';

const VERSION = "2.0.0";
class ObjectPool {
  constructor(factory, reset, maxSize = 50) {
    Object.defineProperty(this, "pool", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "factory", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "reset", {
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
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }
  get() {
    return this.pool.pop() || this.factory();
  }
  release(obj) {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }
  clear() {
    this.pool.length = 0;
  }
}
class FastCacheKeyBuilder {
  constructor() {
    Object.defineProperty(this, "buffer", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
  }
  static get() {
    return FastCacheKeyBuilder.instance;
  }
  add(value) {
    if (value !== void 0) {
      this.buffer.push(String(value));
    }
    return this;
  }
  build() {
    if (this.buffer.length === 0) return "";
    const result = this.buffer.join(FastCacheKeyBuilder.separator);
    this.buffer.length = 0;
    return result;
  }
  reset() {
    this.buffer.length = 0;
  }
}
Object.defineProperty(FastCacheKeyBuilder, "separator", {
  enumerable: true,
  configurable: true,
  writable: true,
  value: "\0"
});
Object.defineProperty(FastCacheKeyBuilder, "instance", {
  enumerable: true,
  configurable: true,
  writable: true,
  value: new FastCacheKeyBuilder()
});
class OptimizedI18n {
  constructor(config = {}) {
    Object.defineProperty(this, "version", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: VERSION
    });
    Object.defineProperty(this, "config", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "_locale", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "_fallbackLocale", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "messages", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "loader", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "storage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "detector", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "cache", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "eventEmitter", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: new EventEmitter()
    });
    Object.defineProperty(this, "interpolation", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "pluralization", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "plugins", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "initialized", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "namespaces", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "defaultNamespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "keySeparator", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "namespaceSeparator", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "cacheKeyBuilder", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: FastCacheKeyBuilder.get()
    });
    Object.defineProperty(this, "optionsPool", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "pooledMarker", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: Symbol("pooled")
    });
    Object.defineProperty(this, "hotPathCache", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "HOT_PATH_CACHE_SIZE", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 30
    });
    Object.defineProperty(this, "accessCount", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "isDev", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: typeof window !== "undefined" && window.__DEV__ === true
    });
    Object.defineProperty(this, "t", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.config = Object.freeze({
      ...config
    });
    this._locale = config.locale || this.detectLocale() || "en";
    this._fallbackLocale = config.fallbackLocale || "en";
    this.keySeparator = config.keySeparator ?? ".";
    this.namespaceSeparator = config.namespaceSeparator ?? ":";
    this.defaultNamespace = config.defaultNamespace || "translation";
    this.interpolation = new InterpolationEngine(config.interpolation);
    this.pluralization = new PluralizationEngine(config.pluralSeparator);
    this.cache = config.cache === false ? new LRUCache(0) : createCache(typeof config.cache === "object" ? config.cache : {
      maxSize: 1e3
    });
    this.optionsPool = new ObjectPool(
      () => /* @__PURE__ */ Object.create(null),
      // Faster than {}
      (obj) => {
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
          delete obj[keys[i]];
        }
      },
      30
    );
    this.loader = config.loader;
    this.storage = config.storage;
    this.detector = config.detector;
    if (config.messages) {
      Object.entries(config.messages).forEach(([locale, msgs]) => {
        this.addMessages(locale, msgs);
      });
    }
    this.t = this.createOptimizedTranslate();
  }
  // ============== Initialization ==============
  async init() {
    this.initialized = true;
    if (this.loader && !this.hasLocale(this._locale)) {
      try {
        const messages = await this.loader.load(this._locale);
        this.addMessages(this._locale, messages);
      } catch (error) {
        console.warn(`Failed to load initial locale ${this._locale}:`, error);
      }
    }
    this.emit("initialized", {
      type: "initialized",
      locale: this._locale
    });
  }
  // ============== Properties ==============
  get locale() {
    return this._locale;
  }
  set locale(value) {
    if (value !== this._locale) {
      const oldLocale = this._locale;
      this._locale = value;
      this.clearPerformanceCaches();
      this.emit("localeChanged", {
        type: "localeChanged",
        locale: value,
        oldLocale
      });
    }
  }
  get fallbackLocale() {
    return this._fallbackLocale;
  }
  set fallbackLocale(value) {
    this._fallbackLocale = value;
    this.clearPerformanceCaches();
  }
  // ============== Core Translation (Optimized) ==============
  createOptimizedTranslate() {
    return (key, optionsOrParams, maybeParams) => {
      if (!optionsOrParams && !maybeParams) {
        const fastKey = this.cacheKeyBuilder.add(this._locale).add(this.defaultNamespace).add(key).build();
        if (this.hotPathCache) {
          const hotCached = this.hotPathCache.get(fastKey);
          if (hotCached !== void 0) {
            return hotCached;
          }
        }
        const cached = this.cache.get(fastKey);
        if (cached !== void 0) {
          this.updateHotPathCache(fastKey, cached);
          return cached;
        }
      }
      const opts = this.normalizeOptionsOptimized(optionsOrParams, maybeParams);
      const result = this.translate(key, opts);
      if (opts[this.pooledMarker]) {
        delete opts[this.pooledMarker];
        this.optionsPool.release(opts);
      }
      return result;
    };
  }
  /**
   * Batch translate multiple keys with optimized performance
   */
  translateBatch(keys, options = {}) {
    const isArray = Array.isArray(keys);
    const keyList = isArray ? keys : Object.values(keys);
    const keyNames = isArray ? null : Object.keys(keys);
    const locale = options.locale || this.locale;
    const namespace = options.namespace || this.defaultNamespace;
    const messages = namespace === this.defaultNamespace ? this.messages.get(locale) : this.namespaces.get(namespace)?.get(locale);
    const results = [];
    for (let i = 0; i < keyList.length; i++) {
      const key = keyList[i];
      const cacheKey = this.getCacheKeyOptimized(locale, key, namespace, options);
      let result = this.cache.get(cacheKey);
      if (result === void 0) {
        let message = messages ? getNestedValue(messages, key, this.keySeparator) : void 0;
        if (message === void 0) {
          message = this.resolveFallbackOptimized(key, options);
        }
        if (message === void 0) {
          result = this.handleMissing(key, locale, namespace, options);
        } else {
          if (options.count !== void 0 && this.pluralization.hasPluralForms(message)) {
            message = this.pluralization.format(message, options.count, locale, options.params);
          }
          if (options.params) {
            const interpolationParams = {
              ...options.params
            };
            interpolationParams.$t = (k, p) => this.translate(k, {
              ...options,
              params: p
            });
            message = this.interpolation.interpolate(message, interpolationParams, locale);
          }
          result = message;
        }
        this.cache.set(cacheKey, result);
      }
      results.push(result);
    }
    if (isArray) {
      return results;
    }
    const resultMap = {};
    for (let i = 0; i < keyNames.length; i++) {
      resultMap[keyNames[i]] = results[i];
    }
    return resultMap;
  }
  translate(key, options = {}) {
    const locale = options.locale || this.locale;
    const namespace = options.namespace || this.defaultNamespace;
    const cacheKey = this.getCacheKeyOptimized(locale, key, namespace, options);
    const cached = this.cache.get(cacheKey);
    if (cached !== void 0) {
      this.updateHotPathCache(cacheKey, cached);
      return cached;
    }
    let message = this.resolveMessageOptimized(key, locale, namespace, options);
    if (message === void 0) {
      message = this.resolveFallbackOptimized(key, options);
    }
    if (message === void 0) {
      const result = this.handleMissing(key, locale, namespace, options);
      this.cache.set(cacheKey, result);
      this.updateHotPathCache(cacheKey, result);
      return result;
    }
    if (options.count !== void 0 && this.pluralization.hasPluralForms(message)) {
      message = this.pluralization.format(message, options.count, locale, options.params);
    }
    if (options.params) {
      const interpolationParams = {
        ...options.params
      };
      interpolationParams.$t = (k, p) => this.translate(k, {
        ...options,
        params: p
      });
      message = this.interpolation.interpolate(message, interpolationParams, locale);
    }
    this.cache.set(cacheKey, message);
    this.updateHotPathCache(cacheKey, message);
    return message;
  }
  exists(key, options = {}) {
    const locale = options.locale || this.locale;
    const namespace = options.namespace || this.defaultNamespace;
    const message = this.resolveMessageOptimized(key, locale, namespace, options);
    return message !== void 0;
  }
  plural(key, count, options = {}) {
    return this.translate(key, {
      ...options,
      count
    });
  }
  // ============== Optimized Private Methods ==============
  getCacheKeyOptimized(locale, key, namespace, options) {
    this.cacheKeyBuilder.reset();
    this.cacheKeyBuilder.add(locale).add(namespace).add(key);
    if (options.count !== void 0) {
      this.cacheKeyBuilder.add(`c${options.count}`);
    }
    if (options.context) {
      this.cacheKeyBuilder.add(`x${options.context}`);
    }
    return this.cacheKeyBuilder.build();
  }
  normalizeOptionsOptimized(optionsOrParams, maybeParams) {
    if (!optionsOrParams) {
      return {};
    }
    const type = typeof optionsOrParams;
    if (type === "string") {
      const opts = this.optionsPool.get();
      opts[this.pooledMarker] = 1;
      opts.defaultValue = optionsOrParams;
      if (maybeParams) opts.params = maybeParams;
      return opts;
    }
    if (type === "object") {
      const obj = optionsOrParams;
      if (obj.locale || obj.fallbackLocale || obj.defaultValue || obj.count !== void 0 || obj.context || obj.namespace) {
        return obj;
      }
      const opts = this.optionsPool.get();
      opts[this.pooledMarker] = 1;
      opts.params = obj;
      return opts;
    }
    return {};
  }
  resolveMessageOptimized(key, locale, namespace, options) {
    const messages = namespace === this.defaultNamespace ? this.messages.get(locale) : this.namespaces.get(namespace)?.get(locale);
    if (!messages) {
      return void 0;
    }
    let resolvedKey = key;
    const nsIndex = this.namespaceSeparator ? key.indexOf(this.namespaceSeparator) : -1;
    if (nsIndex > -1) {
      const keyNamespace = key.substring(0, nsIndex);
      resolvedKey = key.substring(nsIndex + this.namespaceSeparator.length);
      const nsMessages = this.namespaces.get(keyNamespace)?.get(locale);
      if (nsMessages) {
        const value2 = getNestedValue(nsMessages, resolvedKey, this.keySeparator);
        if (value2 !== void 0 && isString(value2)) {
          return value2;
        }
      }
    }
    const value = getNestedValue(messages, resolvedKey, this.keySeparator);
    if (value !== void 0) {
      if (isString(value)) {
        return value;
      } else if (isPlainObject(value) && options.count !== void 0) {
        return this.pluralization.selectPlural(value, options.count, locale);
      }
    }
    return void 0;
  }
  resolveFallbackOptimized(key, options) {
    const fallbacks = Array.isArray(this.fallbackLocale) ? this.fallbackLocale : [this.fallbackLocale];
    for (let i = 0; i < fallbacks.length; i++) {
      const fallback = fallbacks[i];
      if (fallback === options.locale) continue;
      const message = this.resolveMessageOptimized(key, fallback, options.namespace || this.defaultNamespace, options);
      if (message !== void 0) {
        if (this.isDev) {
          this.emit("fallback", {
            key,
            locale: options.locale || this.locale,
            fallback
          });
        }
        return message;
      }
    }
    return void 0;
  }
  updateHotPathCache(key, value) {
    if (!this.hotPathCache) {
      this.hotPathCache = /* @__PURE__ */ new Map();
    }
    if (!this.accessCount) {
      this.accessCount = /* @__PURE__ */ new Map();
    }
    const count = (this.accessCount.get(key) || 0) + 1;
    this.accessCount.set(key, count);
    if (count > 2) {
      if (this.hotPathCache.size >= this.HOT_PATH_CACHE_SIZE) {
        const leastUsedKey = this.findLeastAccessedKey();
        if (leastUsedKey) {
          this.hotPathCache.delete(leastUsedKey);
          this.accessCount.delete(leastUsedKey);
        }
      }
      this.hotPathCache.set(key, value);
    }
  }
  updateAccessCount(key) {
    if (!this.accessCount) {
      this.accessCount = /* @__PURE__ */ new Map();
    }
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
  }
  findLeastAccessedKey() {
    if (!this.accessCount || !this.hotPathCache) return void 0;
    let minKey;
    let minCount = Infinity;
    for (const key of this.hotPathCache.keys()) {
      const count = this.accessCount.get(key) || 0;
      if (count < minCount) {
        minCount = count;
        minKey = key;
      }
    }
    return minKey;
  }
  clearPerformanceCaches() {
    this.hotPathCache?.clear();
    this.accessCount?.clear();
    this.cache.clear();
  }
  // ============== Locale Management ==============
  async setLocale(locale) {
    const oldLocale = this.locale;
    if (!this.hasLocale(locale) && this.loader) {
      this.emit("loading", {
        type: "loading",
        locale
      });
      try {
        const messages = await this.loader.load(locale);
        this.addMessages(locale, messages);
        this.emit("loaded", {
          type: "loaded",
          locale
        });
      } catch (err) {
        this.emit("loadError", {
          type: "loadError",
          locale,
          error: err
        });
        throw err;
      }
    }
    this.locale = locale;
    this.clearPerformanceCaches();
    this.emit("localeChanged", {
      type: "localeChanged",
      locale,
      oldLocale
    });
  }
  getLocale() {
    return this.locale;
  }
  addLocale(locale, messages) {
    this.addMessages(locale, messages);
  }
  removeLocale(locale) {
    this.messages.delete(locale);
    this.namespaces.forEach((ns) => ns.delete(locale));
    this.clearPerformanceCaches();
  }
  hasLocale(locale) {
    return this.messages.has(locale);
  }
  getAvailableLocales() {
    return Array.from(this.messages.keys());
  }
  // ============== Message Management ==============
  addMessages(locale, messages, namespace) {
    if (namespace) {
      if (!this.namespaces.has(namespace)) {
        this.namespaces.set(namespace, /* @__PURE__ */ new Map());
      }
      this.namespaces.get(namespace).set(locale, messages);
    } else {
      this.messages.set(locale, messages);
    }
    this.clearPerformanceCaches();
  }
  setMessages(locale, messages, namespace) {
    this.addMessages(locale, messages, namespace);
  }
  getMessages(locale, namespace) {
    const targetLocale = locale || this.locale;
    if (namespace) {
      return this.namespaces.get(namespace)?.get(targetLocale) || null;
    }
    return this.messages.get(targetLocale) || null;
  }
  mergeMessages(locale, messages, namespace) {
    const existing = this.getMessages(locale, namespace) || {};
    const merged = deepMerge({}, existing, messages);
    this.setMessages(locale, merged, namespace);
  }
  // ============== Event Methods ==============
  on(event, listener) {
    this.eventEmitter.on(event, listener);
    return () => this.eventEmitter.off(event, listener);
  }
  off(event, listener) {
    this.eventEmitter.off(event, listener);
  }
  once(event, listener) {
    this.eventEmitter.once(event, listener);
  }
  emit(event, data) {
    const eventData = {
      type: event,
      ...data
    };
    this.eventEmitter.emit(event, eventData);
  }
  // ============== Namespace Management ==============
  async loadNamespace(namespace, locale) {
    const targetLocale = locale || this.locale;
    if (this.loader && this.loader.load) {
      try {
        const messages = await this.loader.load(targetLocale, namespace);
        this.addMessages(targetLocale, messages, namespace);
        this.emit("namespaceLoaded", {
          namespace,
          locale: targetLocale
        });
      } catch (error) {
        console.warn(`Failed to load namespace ${namespace} for locale ${targetLocale}:`, error);
        throw error;
      }
    }
  }
  hasNamespace(namespace, locale) {
    const targetLocale = locale || this.locale;
    return this.namespaces.get(namespace)?.has(targetLocale) || false;
  }
  // ============== Formatting Methods ==============
  format(value, format, locale, options) {
    const targetLocale = locale || this.locale;
    if (this.config.formatters && this.config.formatters[format]) {
      return this.config.formatters[format].format(value, format, targetLocale, options);
    }
    return String(value);
  }
  number(value, options) {
    try {
      return new Intl.NumberFormat(this.locale, options).format(value);
    } catch (error) {
      console.warn("Failed to format number:", error);
      return String(value);
    }
  }
  currency(value, currency, options) {
    try {
      return new Intl.NumberFormat(this.locale, {
        style: "currency",
        currency,
        ...options
      }).format(value);
    } catch (error) {
      console.warn("Failed to format currency:", error);
      return `${currency} ${value}`;
    }
  }
  date(value, options) {
    try {
      const date = value instanceof Date ? value : new Date(value);
      return new Intl.DateTimeFormat(this.locale, options).format(date);
    } catch (error) {
      console.warn("Failed to format date:", error);
      return String(value);
    }
  }
  relativeTime(value, options) {
    try {
      const date = value instanceof Date ? value : new Date(value);
      const now = /* @__PURE__ */ new Date();
      const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1e3);
      const units = [["year", 60 * 60 * 24 * 365], ["month", 60 * 60 * 24 * 30], ["week", 60 * 60 * 24 * 7], ["day", 60 * 60 * 24], ["hour", 60 * 60], ["minute", 60], ["second", 1]];
      for (const [unit, secondsInUnit] of units) {
        if (Math.abs(diffInSeconds) >= secondsInUnit) {
          const value2 = Math.floor(diffInSeconds / secondsInUnit);
          return new Intl.RelativeTimeFormat(this.locale, options).format(value2, unit);
        }
      }
      return new Intl.RelativeTimeFormat(this.locale, options).format(0, "second");
    } catch (error) {
      console.warn("Failed to format relative time:", error);
      return String(value);
    }
  }
  // ============== Plugin Management ==============
  async use(plugin) {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already installed`);
      return;
    }
    await plugin.install(this);
    this.plugins.set(plugin.name, plugin);
    this.emit("pluginInstalled", {
      plugin: plugin.name
    });
  }
  async unuse(plugin) {
    const pluginName = typeof plugin === "string" ? plugin : plugin.name;
    const installedPlugin = this.plugins.get(pluginName);
    if (!installedPlugin) {
      console.warn(`Plugin ${pluginName} is not installed`);
      return;
    }
    if (installedPlugin.uninstall) {
      await installedPlugin.uninstall(this);
    }
    this.plugins.delete(pluginName);
    this.emit("pluginUninstalled", {
      plugin: pluginName
    });
  }
  // ============== Lifecycle Methods ==============
  async ready() {
    if (!this.initialized) {
      await this.init();
    }
  }
  // ============== Utility Methods ==============
  clone(config) {
    const mergedConfig = {
      ...this.config,
      ...config
    };
    const cloned = new OptimizedI18n(mergedConfig);
    this.messages.forEach((messages, locale) => {
      cloned.addMessages(locale, messages);
    });
    this.namespaces.forEach((locales, namespace) => {
      locales.forEach((messages, locale) => {
        cloned.addMessages(locale, messages, namespace);
      });
    });
    return cloned;
  }
  createContext(namespace) {
    return {
      namespace,
      t: (key, options) => {
        return this.translate(key, {
          ...options,
          namespace
        });
      },
      exists: (key, options) => {
        return this.exists(key, {
          ...options,
          namespace
        });
      }
    };
  }
  handleMissing(key, locale, namespace, options) {
    if (this.isDev) {
      this.emit("missingKey", {
        type: "missingKey",
        key,
        locale,
        namespace
      });
      if (this.config?.warnOnMissing !== false) {
        warn(`Missing translation for key "${key}" in locale "${locale}"`);
      }
    }
    if (this.config?.missingKeyHandler) {
      return this.config?.missingKeyHandler(key, locale, namespace, options.defaultValue);
    }
    return options.defaultValue || key;
  }
  detectLocale() {
    if (this.detector) {
      return this.detector.detect();
    }
    return getBrowserLanguage();
  }
  // ... implement remaining methods from original I18n class
  destroy() {
    this.clearPerformanceCaches();
    this.messages.clear();
    this.namespaces.clear();
    this.plugins.clear();
    this.eventEmitter.removeAllListeners();
    this.optionsPool.clear();
    if ("destroy" in this.cache && typeof this.cache.destroy === "function") {
      this.cache.destroy();
    }
  }
}

export { FastCacheKeyBuilder, OptimizedI18n as I18n, ObjectPool, OptimizedI18n };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=i18n-optimized.js.map
