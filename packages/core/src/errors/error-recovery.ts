/**
 * @ldesign/i18n - Error Recovery Strategy
 * 错误恢复策略和降级处理
 */

import type { Locale, Messages } from '../types'
import { LoadError, TranslationError } from './index'

/**
 * 恢复策略类型
 */
export enum RecoveryStrategy {
  /** 使用降级语言 */
  FALLBACK_LOCALE = 'fallback_locale',
  /** 使用缓存 */
  USE_CACHE = 'use_cache',
  /** 使用默认值 */
  USE_DEFAULT = 'use_default',
  /** 重试 */
  RETRY = 'retry',
  /** 跳过错误 */
  SKIP = 'skip',
  /** 抛出错误 */
  THROW = 'throw',
}

/**
 * 恢复选项
 */
export interface RecoveryOptions {
  /** 降级语言列表 */
  fallbackLocales?: Locale[]
  /** 默认消息 */
  defaultMessages?: Messages
  /** 是否使用缓存 */
  useCache?: boolean
  /** 最大重试次数 */
  maxRetries?: number
  /** 错误回调 */
  onError?: (error: Error, strategy: RecoveryStrategy) => void
}

/**
 * 恢复结果
 */
export interface RecoveryResult<T> {
  /** 是否成功 */
  success: boolean
  /** 结果数据 */
  data?: T
  /** 使用的策略 */
  strategy: RecoveryStrategy
  /** 错误信息（如果失败） */
  error?: Error
}

/**
 * 错误恢复管理器
 * 
 * 提供智能的错误恢复策略：
 * - 自动降级到备用语言
 * - 使用缓存数据
 * - 提供默认值
 * - 优雅降级
 * 
 * @example
 * ```typescript
 * const recovery = new ErrorRecovery({
 *   fallbackLocales: ['en', 'zh-CN'],
 *   useCache: true
 * });
 * 
 * const result = await recovery.recover(
 *   async () => await loader.load('fr'),
 *   error,
 *   { locale: 'fr' }
 * );
 * 
 * if (result.success) {
 *   console.log('恢复成功:', result.strategy);
 * }
 * ```
 */
export class ErrorRecovery {
  private options: RecoveryOptions
  private cache: Map<string, any> = new Map()

  constructor(options: RecoveryOptions = {}) {
    this.options = {
      fallbackLocales: options.fallbackLocales ?? ['en'],
      defaultMessages: options.defaultMessages ?? {},
      useCache: options.useCache ?? true,
      maxRetries: options.maxRetries ?? 3,
      onError: options.onError ?? (() => {}),
    }
  }

  /**
   * 尝试恢复错误
   * 
   * @param fn - 原始操作
   * @param error - 发生的错误
   * @param context - 上下文信息
   * @returns 恢复结果
   */
  async recover<T>(
    fn: () => Promise<T>,
    error: Error,
    context: { locale?: Locale; key?: string } = {},
  ): Promise<RecoveryResult<T>> {
    // 1. 尝试从缓存恢复
    if (this.options.useCache) {
      const cacheResult = this.recoverFromCache<T>(context)
      if (cacheResult.success) {
        return cacheResult
      }
    }

    // 2. 尝试使用降级语言
    if (error instanceof LoadError && context.locale) {
      const fallbackResult = await this.recoverFromFallbackLocale<T>(fn, context.locale)
      if (fallbackResult.success) {
        return fallbackResult
      }
    }

    // 3. 尝试使用默认值
    if (error instanceof TranslationError && context.key) {
      const defaultResult = this.recoverFromDefault<T>(context.key)
      if (defaultResult.success) {
        return defaultResult
      }
    }

    // 4. 所有恢复策略都失败
    this.options.onError?.(error, RecoveryStrategy.THROW)
    
    return {
      success: false,
      strategy: RecoveryStrategy.THROW,
      error,
    }
  }

  /**
   * 从缓存恢复
   */
  private recoverFromCache<T>(context: { locale?: Locale; key?: string }): RecoveryResult<T> {
    const cacheKey = this.getCacheKey(context.locale, context.key)
    const cached = this.cache.get(cacheKey)

    if (cached !== undefined) {
      return {
        success: true,
        data: cached as T,
        strategy: RecoveryStrategy.USE_CACHE,
      }
    }

    return {
      success: false,
      strategy: RecoveryStrategy.USE_CACHE,
    }
  }

  /**
   * 从降级语言恢复
   */
  private async recoverFromFallbackLocale<T>(
    fn: () => Promise<T>,
    failedLocale: Locale,
  ): Promise<RecoveryResult<T>> {
    const fallbackLocales = this.options.fallbackLocales?.filter(
      locale => locale !== failedLocale,
    ) ?? []

    for (const fallbackLocale of fallbackLocales) {
      try {
        const data = await fn()
        
        // 缓存结果
        const cacheKey = this.getCacheKey(fallbackLocale)
        this.cache.set(cacheKey, data)

        return {
          success: true,
          data,
          strategy: RecoveryStrategy.FALLBACK_LOCALE,
        }
      } catch (error) {
        // 继续尝试下一个降级语言
        continue
      }
    }

    return {
      success: false,
      strategy: RecoveryStrategy.FALLBACK_LOCALE,
    }
  }

  /**
   * 从默认值恢复
   */
  private recoverFromDefault<T>(key: string): RecoveryResult<T> {
    const defaultValue = this.getNestedValue(this.options.defaultMessages ?? {}, key)

    if (defaultValue !== undefined) {
      return {
        success: true,
        data: defaultValue as T,
        strategy: RecoveryStrategy.USE_DEFAULT,
      }
    }

    return {
      success: false,
      strategy: RecoveryStrategy.USE_DEFAULT,
    }
  }

  /**
   * 设置缓存
   */
  setCache(locale: Locale, key: string | undefined, data: any): void {
    const cacheKey = this.getCacheKey(locale, key)
    this.cache.set(cacheKey, data)
  }

  /**
   * 清除缓存
   */
  clearCache(locale?: Locale, key?: string): void {
    if (locale || key) {
      const cacheKey = this.getCacheKey(locale, key)
      this.cache.delete(cacheKey)
    } else {
      this.cache.clear()
    }
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(locale?: Locale, key?: string): string {
    return `${locale || 'global'}:${key || 'all'}`
  }

  /**
   * 获取嵌套值
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return undefined
      }
    }

    return current
  }
}

/**
 * 错误日志收集器
 * 
 * 收集和管理错误日志，用于调试和监控
 */
export interface ErrorLog {
  /** 错误对象 */
  error: Error
  /** 时间戳 */
  timestamp: number
  /** 上下文信息 */
  context?: any
  /** 错误类型 */
  type: string
  /** 恢复策略（如果有） */
  recoveryStrategy?: RecoveryStrategy
}

/**
 * 日志收集器选项
 */
export interface ErrorLoggerOptions {
  /** 最大日志数量 */
  maxLogs?: number
  /** 是否启用 */
  enabled?: boolean
  /** 日志回调 */
  onLog?: (log: ErrorLog) => void
}

/**
 * 错误日志收集器
 * 
 * @example
 * ```typescript
 * const logger = new ErrorLogger({
 *   maxLogs: 100,
 *   onLog: (log) => {
 *     console.error('I18n Error:', log);
 *     // 发送到监控系统
 *   }
 * });
 * 
 * logger.log(error, { locale: 'zh-CN', key: 'app.title' });
 * const recentErrors = logger.getRecentLogs(10);
 * ```
 */
export class ErrorLogger {
  private logs: ErrorLog[] = []
  private options: Required<ErrorLoggerOptions>

  constructor(options: ErrorLoggerOptions = {}) {
    this.options = {
      maxLogs: options.maxLogs ?? 100,
      enabled: options.enabled ?? true,
      onLog: options.onLog ?? (() => {}),
    }
  }

  /**
   * 记录错误
   */
  log(error: Error, context?: any, recoveryStrategy?: RecoveryStrategy): void {
    if (!this.options.enabled) {
      return
    }

    const log: ErrorLog = {
      error,
      timestamp: Date.now(),
      context,
      type: error.constructor.name,
      recoveryStrategy,
    }

    this.logs.push(log)

    // 限制日志数量
    if (this.logs.length > this.options.maxLogs) {
      this.logs.shift()
    }

    // 触发回调
    this.options.onLog(log)
  }

  /**
   * 获取最近的日志
   */
  getRecentLogs(count: number = 10): ErrorLog[] {
    return this.logs.slice(-count)
  }

  /**
   * 获取所有日志
   */
  getAllLogs(): ErrorLog[] {
    return [...this.logs]
  }

  /**
   * 按类型过滤日志
   */
  getLogsByType(type: string): ErrorLog[] {
    return this.logs.filter(log => log.type === type)
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number
    byType: Record<string, number>
    recentErrors: number
  } {
    const byType: Record<string, number> = {}
    const oneHourAgo = Date.now() - 60 * 60 * 1000

    let recentErrors = 0

    for (const log of this.logs) {
      byType[log.type] = (byType[log.type] || 0) + 1
      if (log.timestamp > oneHourAgo) {
        recentErrors++
      }
    }

    return {
      total: this.logs.length,
      byType,
      recentErrors,
    }
  }

  /**
   * 清除日志
   */
  clear(): void {
    this.logs = []
  }

  /**
   * 导出日志为 JSON
   */
  exportToJSON(): string {
    return JSON.stringify(this.logs.map(log => ({
      error: {
        name: log.error.name,
        message: log.error.message,
        stack: log.error.stack,
      },
      timestamp: new Date(log.timestamp).toISOString(),
      context: log.context,
      type: log.type,
      recoveryStrategy: log.recoveryStrategy,
    })), null, 2)
  }
}