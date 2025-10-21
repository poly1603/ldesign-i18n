/**
 * Utils module exports
 */
export * from './bundle-optimization';
export { assert, createErrorBoundary, ErrorHandler, ErrorSeverity, warn as errorWarn, globalErrorHandler, I18nError, I18nErrorType, info, safeTranslate } from './error-handler';
export { debounce, deepClone, deepMerge, error, escapeHtml, EventEmitter, flattenObject, formatLocale, generateCacheKey, getBrowserLanguage, getNestedValue, isFunction, isPlainObject, isPromise, isString, parseLocale, setNestedValue, throttle, unflattenObject, warn } from './helpers';
export { memoize, PerformanceMark, RAFScheduler } from './performance';
