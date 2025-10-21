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

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('./adapters/vue.cjs');
var index = require('./core/index.cjs');
var cache = require('./core/cache.cjs');
var i18nOptimized = require('./core/i18n-optimized.cjs');
var interpolation = require('./core/interpolation.cjs');
var pluralization = require('./core/pluralization.cjs');
var engine = require('./engine.cjs');
var plugin = require('./plugin.cjs');
var bundleOptimization = require('./utils/bundle-optimization.cjs');
var helpers = require('./utils/helpers.cjs');

const LazyFeatures = {
  async loadOfflineFirst() {
    const module = await Promise.resolve().then(function () { return require('./core/offline-first.cjs'); });
    return module;
  },
  async loadPerformanceMonitor() {
    const module = await Promise.resolve().then(function () { return require('./core/performance-monitor.cjs'); });
    return module;
  },
  async loadContextAware() {
    const module = await Promise.resolve().then(function () { return require('./core/context-aware.cjs'); });
    return module;
  },
  async loadAdvancedFormatter() {
    const module = await Promise.resolve().then(function () { return require('./core/advanced-formatter.cjs'); });
    return module;
  }
};
const PluginLoader = {
  async load(pluginName) {
    const {
      lazyLoadPlugin
    } = await Promise.resolve().then(function () { return require('./utils/bundle-optimization.cjs'); });
    return lazyLoadPlugin(pluginName);
  }
};
let globalI18n = null;
function useI18n(config) {
  if (!globalI18n) {
    globalI18n = index.createI18n(config);
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
    const module = await Promise.resolve().then(function () { return require('./adapters/vue.cjs'); });
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

exports.I18nT = vue.I18nT;
exports.createVueI18n = vue.createVueI18n;
exports.useCurrency = vue.useCurrency;
exports.useDate = vue.useDate;
exports.useNumber = vue.useNumber;
exports.usePlural = vue.usePlural;
exports.useRelativeTime = vue.useRelativeTime;
exports.useTranslation = vue.useTranslation;
exports.useVueI18n = vue.useI18n;
exports.vI18n = vue.vI18n;
exports.createI18n = index.createI18n;
exports.LRUCache = cache.LRUCache;
exports.MultiTierCache = cache.MultiTierCache;
exports.StorageCache = cache.StorageCache;
exports.WeakCache = cache.WeakCache;
exports.createCache = cache.createCache;
exports.FastCacheKeyBuilder = i18nOptimized.FastCacheKeyBuilder;
exports.I18n = i18nOptimized.OptimizedI18n;
exports.ObjectPool = i18nOptimized.ObjectPool;
exports.OptimizedI18n = i18nOptimized.OptimizedI18n;
exports.default = i18nOptimized.OptimizedI18n;
exports.InterpolationEngine = interpolation.InterpolationEngine;
exports.PluralizationEngine = pluralization.PluralizationEngine;
exports.createDefaultI18nEnginePlugin = engine.createDefaultI18nEnginePlugin;
exports.createI18nEnginePlugin = engine.createI18nEnginePlugin;
exports.i18nPlugin = engine.i18nPlugin;
exports.createI18nPlugin = plugin.createI18nPlugin;
exports.useI18nPlugin = plugin.useI18n;
exports.BUILD_FLAGS = bundleOptimization.BUILD_FLAGS;
exports.CHUNK_NAMES = bundleOptimization.CHUNK_NAMES;
exports.ESM_ONLY = bundleOptimization.ESM_ONLY;
exports.FEATURES = bundleOptimization.FEATURES;
exports.MODULE_FEDERATION_CONFIG = bundleOptimization.MODULE_FEDERATION_CONFIG;
exports.ROLLUP_OPTIMIZATION = bundleOptimization.ROLLUP_OPTIMIZATION;
exports.VITE_OPTIMIZATION = bundleOptimization.VITE_OPTIMIZATION;
exports.analyzeExportSizes = bundleOptimization.analyzeExportSizes;
exports.conditionalImport = bundleOptimization.conditionalImport;
exports.createMinimalI18n = bundleOptimization.createMinimalI18n;
exports.generatePreloadHints = bundleOptimization.generatePreloadHints;
exports.getBundleSizeRecommendations = bundleOptimization.getBundleSizeRecommendations;
exports.lazyLoadPlugin = bundleOptimization.lazyLoadPlugin;
exports.pureCapitalize = bundleOptimization.pureCapitalize;
exports.pureFormatDate = bundleOptimization.pureFormatDate;
exports.pureFormatNumber = bundleOptimization.pureFormatNumber;
exports.EventEmitter = helpers.EventEmitter;
exports.debounce = helpers.debounce;
exports.deepClone = helpers.deepClone;
exports.deepMerge = helpers.deepMerge;
exports.error = helpers.error;
exports.escapeHtml = helpers.escapeHtml;
exports.flattenObject = helpers.flattenObject;
exports.formatLocale = helpers.formatLocale;
exports.generateCacheKey = helpers.generateCacheKey;
exports.getBrowserLanguage = helpers.getBrowserLanguage;
exports.getNestedValue = helpers.getNestedValue;
exports.isFunction = helpers.isFunction;
exports.isPlainObject = helpers.isPlainObject;
exports.isPromise = helpers.isPromise;
exports.isString = helpers.isString;
exports.parseLocale = helpers.parseLocale;
exports.setNestedValue = helpers.setNestedValue;
exports.throttle = helpers.throttle;
exports.unflattenObject = helpers.unflattenObject;
exports.warn = helpers.warn;
exports.Adapters = Adapters;
exports.BUILD_DATE = BUILD_DATE;
exports.LazyFeatures = LazyFeatures;
exports.PluginLoader = PluginLoader;
exports.VERSION = VERSION;
exports.clearGlobalI18n = clearGlobalI18n;
exports.getGlobalI18n = getGlobalI18n;
exports.setGlobalI18n = setGlobalI18n;
exports.t = t;
exports.useI18n = useI18n;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
