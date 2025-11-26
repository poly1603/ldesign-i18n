/**
 * 工具模块导出
 *
 * 提供各类工具函数和辅助类
 */

export * from './bundle-optimization'

// Export context-aware translations
export * from './context-aware'

// Export coverage reporter
export * from './coverage-reporter'

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
  safeTranslate,
} from './error-handler'

// 导出哈希缓存键工具
export * from './hash-cache-key'

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
  warn,
} from './helpers'

// Export hot reload (development)
export * from './hot-reload'

// 导出翻译键验证器
export * from './key-validator'

// 导出语言元数据和 RTL 支持
export * from './locale-metadata'

// Export from performance (optimized versions)
export {
  memoize,
  PerformanceMark,
  RAFScheduler,
} from './performance'

// Export performance budget monitoring
export * from './performance-budget'

// Export smart fallback chain
export * from './smart-fallback'

// Export enhanced event emitter (with priority and logging)
export * from './enhanced-event-emitter'

// Export key finder (fuzzy search and wildcard)
export * from './key-finder'

// Export advanced key validator
export * from './key-validator-advanced'
