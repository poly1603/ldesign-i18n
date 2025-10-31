/**
 * @ldesign/i18n-core
 * Framework-agnostic i18n core library
 * 
 * @version 4.0.0
 * @author LDesign Team
 * @license MIT
 */

// ==================== 核心导出 ====================

// 主 I18n 类
export { OptimizedI18n, OptimizedI18n as I18n } from './core/i18n-optimized'

// 工厂函数
export { createI18n } from './core'

// ==================== 缓存系统 ====================

export {
  createCache,
  LRUCache,
  MultiTierCache,
  StorageCache,
  WeakCache,
} from './core/cache'

export { AdaptiveCache } from './core/adaptive-cache'
export { OptimizedLRUCache } from './core/optimized-cache'

// ==================== 核心引擎 ====================

export { InterpolationEngine } from './core/interpolation'
export { PluralizationEngine, type PluralCategory } from './core/pluralization'
export { TemplateCompiler } from './core/template-compiler'
export { PipelineFormatter } from './core/pipeline-formatter'
export { AdvancedFormatter } from './core/advanced-formatter'

// ==================== 性能优化 ====================

export { FastCacheKeyBuilder, ObjectFactory } from './core/i18n-optimized'
export { PerformanceMonitor } from './core/performance-monitor'
export { MemoryOptimizer } from './core/memory-optimizer'

// ==================== 高级功能 ====================

export { LazyLoader } from './core/lazy-loader'
export { ContextAwareTranslator } from './core/context-aware'
export { WeakEventEmitter } from './core/weak-event-emitter'

// ==================== 类型定义 ====================

export type {
  // 基础类型
  Locale,
  MessageKey,
  MessageValue,
  Messages,
  
  // 配置类型
  I18nConfig,
  I18nContext,
  InterpolationConfig,
  InterpolationOptions,
  InterpolationParams,
  TranslateOptions,
  DetectionConfig,
  
  // 实例和接口
  I18nInstance,
  I18nPlugin,
  FrameworkAdapter,
  
  // 组件接口
  MessageLoader,
  MessageStorage,
  LanguageDetector,
  LanguagePackage,
  
  // 函数类型
  TranslationFunction,
  ErrorHandler,
  MissingKeyHandler,
  Formatter,
  PluralRule,
  
  // 事件类型
  I18nEventType,
  I18nEventData,
  I18nEventListener,
  
  // 工具类型
  DeepPartial,
  PromiseOr,
  ValueOf,
} from './types'

// ==================== 工具函数 ====================

export * from './utils/hash-cache-key'
export * from './utils/error-handler'
export * from './utils/locale-metadata'

// 高级工具(按需导入)
export type { PerformanceBudget } from './utils/performance-budget'

// ==================== 调试工具 ====================

export type {
  I18nProfiler,
  ProfilingReport,
  TranslationInspector,
  TranslationUsage,
  UsageReport,
} from './debug'

// ==================== 插件系统 ====================

export * from './plugins'

// ==================== 懒加载功能 ====================

/**
 * 懒加载高级功能模块
 */
export const LazyFeatures = {
  /**
   * 加载离线优先插件
   */
  async loadOfflineFirst() {
    const module = await import('./core/offline-first')
    return module
  },

  /**
   * 加载性能监控器
   */
  async loadPerformanceMonitor() {
    const module = await import('./core/performance-monitor')
    return module
  },

  /**
   * 加载上下文感知翻译器
   */
  async loadContextAware() {
    const module = await import('./core/context-aware')
    return module
  },

  /**
   * 加载高级格式化器
   */
  async loadAdvancedFormatter() {
    const module = await import('./core/advanced-formatter')
    return module
  },
}

/**
 * 懒加载调试工具
 */
export const DebugTools = {
  /**
   * 加载性能分析器
   */
  async loadProfiler() {
    const module = await import('./debug/profiler')
    return module
  },

  /**
   * 加载翻译检查器
   */
  async loadInspector() {
    const module = await import('./debug/inspector')
    return module
  },
}

// ==================== 版本信息 ====================

export const VERSION = '4.0.0'
export const BUILD_DATE = new Date().toISOString()

// ==================== 默认导出 ====================

export { OptimizedI18n as default } from './core/i18n-optimized'

