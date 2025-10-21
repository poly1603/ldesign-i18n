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

var i18nOptimized = require('./i18n-optimized.cjs');
var advancedFormatter = require('./advanced-formatter.cjs');
var cache = require('./cache.cjs');
var interpolation = require('./interpolation.cjs');
var lazyLoader = require('./lazy-loader.cjs');
var pluralization = require('./pluralization.cjs');

function createI18n(config) {
  const instance = new i18nOptimized.OptimizedI18n(config || {});
  if (config?.messages) {
    instance.init().catch((err) => {
      console.error("Failed to initialize i18n:", err);
    });
  }
  return instance;
}

exports.FastCacheKeyBuilder = i18nOptimized.FastCacheKeyBuilder;
exports.I18n = i18nOptimized.OptimizedI18n;
exports.ObjectPool = i18nOptimized.ObjectPool;
exports.OptimizedI18n = i18nOptimized.OptimizedI18n;
exports.AdvancedFormatter = advancedFormatter.AdvancedFormatter;
exports.clearFormatterCache = advancedFormatter.clearFormatterCache;
exports.createAdvancedFormatter = advancedFormatter.createAdvancedFormatter;
exports.LRUCache = cache.LRUCache;
exports.MultiTierCache = cache.MultiTierCache;
exports.StorageCache = cache.StorageCache;
exports.WeakCache = cache.WeakCache;
exports.createCache = cache.createCache;
exports.InterpolationEngine = interpolation.InterpolationEngine;
exports.LazyLoader = lazyLoader.LazyLoader;
exports.createLazyLoader = lazyLoader.createLazyLoader;
exports.PluralizationEngine = pluralization.PluralizationEngine;
exports.createI18n = createI18n;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
