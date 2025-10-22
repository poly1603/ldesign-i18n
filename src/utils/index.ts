/**
 * Utils module exports
 */

export * from './bundle-optimization'

// Export hash cache key utilities
export * from './hash-cache-key'

// Export locale metadata and RTL support
export * from './locale-metadata'

// Export smart fallback chain
export * from './smart-fallback'

// Export context-aware translations
export * from './context-aware'

// Export performance budget monitoring
export * from './performance-budget'

// Export coverage reporter
export * from './coverage-reporter'

// Export hot reload (development)
export * from './hot-reload'

// Export from error-handler
export {
  assert,
  createErrorBoundary,
  ErrorHandler,
  ErrorSeverity,
  // Avoid conflict with helpers' warn
  warn as errorWarn,
  globalErrorHandler,
  I18nError,
  I18nErrorType,
  info,
  safeTranslate
} from './error-handler'

// Export from helpers
export {
  debounce,
  deepClone,
  deepMerge,
  error,
  escapeHtml,
  EventEmitter,
  flattenObject,
  formatLocale,
  generateCacheKey,
  getBrowserLanguage,
  getNestedValue,
  isFunction,
  isPlainObject,
  isPromise,
  isString,
  parseLocale,
  setNestedValue,
  throttle,
  unflattenObject,
  // Export warn and error from helpers
  warn
} from './helpers'

// Export from performance (optimized versions)
export {
  memoize,
  PerformanceMark,
  RAFScheduler
} from './performance'