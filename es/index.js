/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
export { I18nT, createVueI18n, useCurrency, useDate, useNumber, usePlural, useRelativeTime, useTranslation, useI18n as useVueI18n, vI18n } from './adapters/vue.js';
import { createI18n } from './core/index.js';
export { LRUCache, MultiTierCache, StorageCache, WeakCache, createCache } from './core/cache.js';
import { OptimizedI18n } from './core/i18n-optimized.js';
export { FastCacheKeyBuilder, ObjectPool } from './core/i18n-optimized.js';
export { InterpolationEngine } from './core/interpolation.js';
export { PluralizationEngine } from './core/pluralization.js';
export { createDefaultI18nEnginePlugin, createI18nEnginePlugin, i18nPlugin } from './engine.js';
export { createI18nPlugin, useI18n as useI18nPlugin } from './plugin.js';
export { BUILD_FLAGS, CHUNK_NAMES, ESM_ONLY, FEATURES, MODULE_FEDERATION_CONFIG, ROLLUP_OPTIMIZATION, VITE_OPTIMIZATION, analyzeExportSizes, conditionalImport, createMinimalI18n, generatePreloadHints, getBundleSizeRecommendations, lazyLoadPlugin, pureCapitalize, pureFormatDate, pureFormatNumber } from './utils/bundle-optimization.js';
export { EventEmitter, debounce, deepClone, deepMerge, error, escapeHtml, flattenObject, formatLocale, generateCacheKey, getBrowserLanguage, getNestedValue, isFunction, isPlainObject, isPromise, isString, parseLocale, setNestedValue, throttle, unflattenObject, warn } from './utils/helpers.js';

const LazyFeatures = {
  async loadOfflineFirst() {
    const module = await import('./core/offline-first.js');
    return module;
  },
  async loadPerformanceMonitor() {
    const module = await import('./core/performance-monitor.js');
    return module;
  },
  async loadContextAware() {
    const module = await import('./core/context-aware.js');
    return module;
  },
  async loadAdvancedFormatter() {
    const module = await import('./core/advanced-formatter.js');
    return module;
  }
};
const PluginLoader = {
  async load(pluginName) {
    const {
      lazyLoadPlugin
    } = await import('./utils/bundle-optimization.js');
    return lazyLoadPlugin(pluginName);
  }
};
let globalI18n = null;
function useI18n(config) {
  if (!globalI18n) {
    globalI18n = createI18n(config);
  }
  return globalI18n;
}
function setGlobalI18n(instance) {
  globalI18n = instance;
}
function getGlobalI18n() {
  if (!globalI18n) {
    throw new Error("Global i18n instance not initialized. Call useI18n() or setGlobalI18n() first.");
  }
  return globalI18n;
}
function clearGlobalI18n() {
  if (globalI18n) {
    globalI18n.destroy();
    globalI18n = null;
  }
}
function t(key, params) {
  return useI18n().t(key, params);
}
const VERSION = "2.0.0";
const BUILD_DATE = (/* @__PURE__ */ new Date()).toISOString();
const Adapters = {
  async vue() {
    const module = await import('./adapters/vue.js');
    return module;
  },
  // Future framework support
  async react() {
    throw new Error("React adapter not yet implemented");
  },
  async angular() {
    throw new Error("Angular adapter not yet implemented");
  },
  async svelte() {
    throw new Error("Svelte adapter not yet implemented");
  }
};

export { Adapters, BUILD_DATE, OptimizedI18n as I18n, LazyFeatures, OptimizedI18n, PluginLoader, VERSION, clearGlobalI18n, createI18n, OptimizedI18n as default, getGlobalI18n, setGlobalI18n, t, useI18n };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
