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

var bundleOptimization = require('./bundle-optimization.cjs');
var errorHandler = require('./error-handler.cjs');
var helpers = require('./helpers.cjs');
var performance = require('./performance.cjs');
var cache = require('../core/cache.cjs');
var interpolation = require('../core/interpolation.cjs');
var pluralization = require('../core/pluralization.cjs');



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
exports.ErrorHandler = errorHandler.ErrorHandler;
Object.defineProperty(exports, "ErrorSeverity", {
	enumerable: true,
	get: function () { return errorHandler.ErrorSeverity; }
});
exports.I18nError = errorHandler.I18nError;
Object.defineProperty(exports, "I18nErrorType", {
	enumerable: true,
	get: function () { return errorHandler.I18nErrorType; }
});
exports.assert = errorHandler.assert;
exports.createErrorBoundary = errorHandler.createErrorBoundary;
exports.errorWarn = errorHandler.warn;
exports.globalErrorHandler = errorHandler.globalErrorHandler;
exports.info = errorHandler.info;
exports.safeTranslate = errorHandler.safeTranslate;
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
exports.PerformanceMark = performance.PerformanceMark;
exports.RAFScheduler = performance.RAFScheduler;
exports.memoize = performance.memoize;
exports.LRUCache = cache.LRUCache;
exports.MultiTierCache = cache.MultiTierCache;
exports.StorageCache = cache.StorageCache;
exports.WeakCache = cache.WeakCache;
exports.createCache = cache.createCache;
exports.InterpolationEngine = interpolation.InterpolationEngine;
exports.PluralizationEngine = pluralization.PluralizationEngine;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
