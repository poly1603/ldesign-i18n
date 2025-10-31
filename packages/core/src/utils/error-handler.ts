/**
 * @ldesign/i18n - 增强的错误处理
 *
 * 提供友好的错误消息、调试信息和开发者体验改进
 *
 * ## 特性
 * - 类型化的错误代码
 * - 详细的错误上下文
 * - 智能建议和解决方案
 * - 错误日志记录
 * - 开发/生产环境差异化处理
 */

import type { Locale, MessageKey, TranslateOptions } from '../types'

/**
 * 错误严重程度级别
 */
export enum ErrorSeverity {
  /** 信息 - 仅供参考 */
  INFO = 'info',
  /** 警告 - 不影响功能但需要注意 */
  WARNING = 'warning',
  /** 错误 - 功能异常但可恢复 */
  ERROR = 'error',
  /** 严重 - 功能无法继续,需要立即处理 */
  CRITICAL = 'critical',
}

/**
 * I18n 错误类型枚举
 *
 * 涵盖所有可能的错误场景
 */
export enum I18nErrorType {
  /** 翻译键不存在 */
  MISSING_KEY = 'MISSING_KEY',
  /** 无效的语言代码 */
  INVALID_LOCALE = 'INVALID_LOCALE',
  /** 加载器错误 */
  LOADER_ERROR = 'LOADER_ERROR',
  /** 参数插值错误 */
  INTERPOLATION_ERROR = 'INTERPOLATION_ERROR',
  /** 复数化错误 */
  PLURALIZATION_ERROR = 'PLURALIZATION_ERROR',
  /** 格式化错误 */
  FORMAT_ERROR = 'FORMAT_ERROR',
  /** 插件错误 */
  PLUGIN_ERROR = 'PLUGIN_ERROR',
  /** 配置错误 */
  CONFIG_ERROR = 'CONFIG_ERROR',
  /** 缓存错误 */
  CACHE_ERROR = 'CACHE_ERROR',
  /** 命名空间错误 */
  NAMESPACE_ERROR = 'NAMESPACE_ERROR',
}

/**
 * I18n 增强错误类
 *
 * 扩展标准 Error,提供:
 * - 错误类型和严重程度
 * - 详细的上下文信息
 * - 智能建议和解决方案
 * - 文档链接
 * - 时间戳记录
 *
 * @example
 * ```typescript
 * throw new I18nError(
 *   I18nErrorType.MISSING_KEY,
 *   'Translation key "app.title" not found',
 *   {
 *     severity: ErrorSeverity.WARNING,
 *     context: { key: 'app.title', locale: 'zh-CN' },
 *     suggestions: ['Check if the key exists', 'Load the locale messages']
 *   }
 * );
 * ```
 */
export class I18nError extends Error {
  /** 错误类型 */
  public readonly type: I18nErrorType
  /** 严重程度 */
  public readonly severity: ErrorSeverity
  /** 上下文信息 */
  public readonly context: Record<string, any>
  /** 发生时间戳 */
  public readonly timestamp: Date
  /** 解决建议 */
  public readonly suggestions: string[]
  /** 文档链接 */
  public readonly documentation?: string

  /**
   * 创建 I18n 错误
   *
   * @param type - 错误类型
   * @param message - 错误消息
   * @param options - 错误选项
   * @param options.severity - 严重程度,默认 ERROR
   * @param options.context - 上下文信息
   * @param options.suggestions - 解决建议
   * @param options.documentation - 文档链接
   * @param options.cause - 原始错误(ES2022)
   */
  constructor(
    type: I18nErrorType,
    message: string,
    options: {
      severity?: ErrorSeverity
      context?: Record<string, any>
      suggestions?: string[]
      documentation?: string
      cause?: Error
    } = {},
  ) {
    super(message)
    this.name = 'I18nError'
    this.type = type
    this.severity = options.severity || ErrorSeverity.ERROR
    this.context = options.context || {}
    this.suggestions = options.suggestions || []
    this.documentation = options.documentation
    this.timestamp = new Date()

    // 设置原始错误(ES2022 特性)
    if (options.cause && 'cause' in Error.prototype) {
      (this as any).cause = options.cause
    }

    // 捕获堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, I18nError)
    }
  }

  /**
   * 格式化为控制台消息
   *
   * 生成友好的多行错误消息,包含:
   * - 错误类型和严重程度
   * - 详细消息
   * - 上下文信息
   * - 解决建议
   * - 文档链接
   *
   * @returns 格式化的控制台消息
   */
  toConsoleMessage(): string {
    const lines: string[] = [
      `[I18n ${this.severity.toUpperCase()}] ${this.type}`,
      `消息: ${this.message}`,
    ]

    if (Object.keys(this.context).length > 0) {
      lines.push(`上下文: ${JSON.stringify(this.context, null, 2)}`)
    }

    if (this.suggestions.length > 0) {
      lines.push('建议:')
      this.suggestions.forEach(s => lines.push(`  - ${s}`))
    }

    if (this.documentation) {
      lines.push(`文档: ${this.documentation}`)
    }

    return lines.join('\n')
  }

  /**
   * 转换为 JSON 对象
   *
   * 用于日志记录、错误上报等
   *
   * @returns JSON 对象
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      type: this.type,
      severity: this.severity,
      message: this.message,
      context: this.context,
      suggestions: this.suggestions,
      documentation: this.documentation,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    }
  }
}

/**
 * 错误处理器
 *
 * 提供详细的调试信息和错误管理
 *
 * ## 功能
 * - 错误日志记录(自动限制大小)
 * - 错误回调注册
 * - 智能建议生成
 * - 开发/生产环境差异化
 * - 错误统计分析
 *
 * @example
 * ```typescript
 * const handler = new ErrorHandler({ isDev: true });
 *
 * // 处理缺失的键
 * const result = handler.handleMissingKey('app.title', 'zh-CN');
 *
 * // 注册错误回调
 * handler.onError(I18nErrorType.MISSING_KEY, (error) => {
 *   console.log('Missing key:', error.context.key);
 * });
 *
 * // 获取错误统计
 * const stats = handler.getErrorStats();
 * ```
 */
export class ErrorHandler {
  /** 是否为开发环境 */
  private readonly isDev: boolean
  /** 错误日志数组 */
  private readonly errorLog: I18nError[] = []
  /** 最大日志容量 */
  private readonly maxLogSize: number
  /** 错误回调映射表 */
  private errorCallbacks: Map<I18nErrorType, ((error: I18nError) => void)[]> = new Map()

  /**
   * 创建错误处理器
   *
   * @param options - 选项配置
   * @param options.isDev - 是否为开发环境,默认自动检测
   * @param options.maxLogSize - 最大日志容量,默认 100
   */
  constructor(options: { isDev?: boolean, maxLogSize?: number } = {}) {
    this.isDev = options.isDev ?? (typeof window !== 'undefined' && (window as any).__DEV__ === true)
    this.maxLogSize = options.maxLogSize ?? 100
  }

  /**
   * 处理缺失的翻译键
   *
   * 提供友好的错误消息和智能建议
   *
   * @param key - 翻译键
   * @param locale - 语言代码
   * @param namespace - 命名空间(可选)
   * @param options - 翻译选项(可选)
   * @returns 降级值(开发环境返回调试信息,生产环境返回默认值或键名)
   */
  handleMissingKey(
    key: MessageKey,
    locale: Locale,
    namespace?: string,
    options?: TranslateOptions,
  ): string {
    const similarKeys = this.findSimilarKeys(key)
    const suggestions: string[] = []

    // Add suggestions based on the error
    if (similarKeys.length > 0) {
      suggestions.push(`Did you mean: ${similarKeys.join(', ')}?`)
    }
    suggestions.push(`Check if the key "${key}" exists in locale "${locale}"`)
    suggestions.push('Ensure the locale messages are properly loaded')

    if (namespace) {
      suggestions.push(`Verify namespace "${namespace}" is loaded`)
    }

    const error = new I18nError(
      I18nErrorType.MISSING_KEY,
      `Translation key "${key}" not found for locale "${locale}"`,
      {
        severity: ErrorSeverity.WARNING,
        context: { key, locale, namespace, options },
        suggestions,
        documentation: 'https://docs.ldesign.io/i18n/missing-keys',
      },
    )

    this.logError(error)

    // Return debug message in development
    if (this.isDev) {
      return this.createDebugMessage(key, locale, namespace)
    }

    // Return fallback in production
    return options?.defaultValue || key
  }

  /**
   * Handle interpolation errors
   */
  handleInterpolationError(
    template: string,
    params: Record<string, any>,
    error: Error,
  ): string {
    const missingParams = this.findMissingParams(template, params)
    const suggestions: string[] = []

    if (missingParams.length > 0) {
      suggestions.push(`Missing parameters: ${missingParams.join(', ')}`)
    }
    suggestions.push('Check parameter names match template placeholders')
    suggestions.push('Ensure parameter values are valid')

    const i18nError = new I18nError(
      I18nErrorType.INTERPOLATION_ERROR,
      `Interpolation failed for template: ${template}`,
      {
        severity: ErrorSeverity.ERROR,
        context: { template, params },
        suggestions,
        cause: error,
        documentation: 'https://docs.ldesign.io/i18n/interpolation',
      },
    )

    this.logError(i18nError)

    // Return template with error marker in development
    if (this.isDev) {
      return `[INTERPOLATION_ERROR: ${template}]`
    }

    // Return original template in production
    return template
  }

  /**
   * Handle loader errors
   */
  handleLoaderError(locale: Locale, namespace?: string, error?: Error): void {
    const suggestions = [
      `Check if locale file for "${locale}" exists`,
      'Verify network connectivity',
      'Check CORS settings if loading from external source',
      'Ensure the loader is properly configured',
    ]

    const i18nError = new I18nError(
      I18nErrorType.LOADER_ERROR,
      `Failed to load messages for locale "${locale}"${namespace ? ` (namespace: ${namespace})` : ''}`,
      {
        severity: ErrorSeverity.ERROR,
        context: { locale, namespace },
        suggestions,
        cause: error,
        documentation: 'https://docs.ldesign.io/i18n/loaders',
      },
    )

    this.logError(i18nError)
    this.emitError(i18nError)
  }

  /**
   * Handle configuration errors
   */
  handleConfigError(message: string, config: any): void {
    const suggestions = [
      'Review the configuration documentation',
      'Check for typos in configuration keys',
      'Ensure required fields are provided',
      'Validate data types match expected values',
    ]

    const error = new I18nError(
      I18nErrorType.CONFIG_ERROR,
      message,
      {
        severity: ErrorSeverity.CRITICAL,
        context: { config },
        suggestions,
        documentation: 'https://docs.ldesign.io/i18n/configuration',
      },
    )

    this.logError(error)
    throw error // Configuration errors should halt execution
  }

  /**
   * Create debug message for missing keys
   */
  private createDebugMessage(key: string, locale: string, namespace?: string): string {
    const parts = [
      `[Missing: ${key}]`,
      `[Locale: ${locale}]`,
    ]

    if (namespace) {
      parts.push(`[NS: ${namespace}]`)
    }

    return parts.join(' ')
  }

  /**
   * Find similar keys (for suggestions)
   */
  // @ts-ignore - key 参数保留供将来实现
  private findSimilarKeys(key: string): string[] {
    // This would need access to available keys
    // For now, return empty array
    // In real implementation, use Levenshtein distance or similar algorithm
    return []
  }

  /**
   * Find missing interpolation parameters
   */
  // eslint-disable-next-line unused-imports/no-unused-vars
  private findMissingParams(template: string, params: Record<string, any>): string[] {
    const placeholders = template.match(/\{\{?\s*(\w+)\s*\}?\}/g) || []
    const missing: string[] = []

    placeholders.forEach((placeholder) => {
      const paramName = placeholder.replace(/\{\{?\s*|\s*\}?\}/g, '')
      if (!(paramName in params)) {
        missing.push(paramName)
      }
    })

    return missing
  }

  /**
   * Log error
   */
  private logError(error: I18nError): void {
    // Add to log
    this.errorLog.push(error)

    // Trim log if too large
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift()
    }

    // Console output in development
    if (this.isDev) {
      const consoleMethod = this.getConsoleMethod(error.severity)
      console[consoleMethod](error.toConsoleMessage())
    }
  }

  /**
   * Get appropriate console method based on severity
   */
  private getConsoleMethod(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.INFO:
        return 'log'
      case ErrorSeverity.WARNING:
        return 'warn'
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        return 'error'
      default:
        return 'log'
    }
  }

  /**
   * Register error callback
   */
  onError(type: I18nErrorType, callback: (error: I18nError) => void): void {
    if (!this.errorCallbacks.has(type)) {
      this.errorCallbacks.set(type, [])
    }
    this.errorCallbacks.get(type)!.push(callback)
  }

  /**
   * Emit error to registered callbacks
   */
  private emitError(error: I18nError): void {
    const callbacks = this.errorCallbacks.get(error.type) || []
    callbacks.forEach(cb => cb(error))
  }

  /**
   * Get error log
   */
  getErrorLog(): I18nError[] {
    return [...this.errorLog]
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog.length = 0
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Record<I18nErrorType, number> {
    const stats: Record<string, number> = {}

    for (const error of this.errorLog) {
      stats[error.type] = (stats[error.type] || 0) + 1
    }

    return stats as Record<I18nErrorType, number>
  }

  /**
   * Export errors for debugging
   */
  exportErrors(): string {
    return JSON.stringify(
      this.errorLog.map(e => e.toJSON()),
      null,
      2,
    )
  }
}

/**
 * Global error handler instance
 */
export const globalErrorHandler = new ErrorHandler()

/**
 * Utility function for safe translation with error boundary
 */
export function safeTranslate(
  translateFn: () => string,
  fallback: string,
): string {
  try {
    return translateFn()
  }
  catch (error) {
    if (typeof window !== 'undefined' && (window as any).__DEV__ === true) {
      console.error('[I18n] Translation failed:', error)
    }
    return fallback
  }
}

/**
 * Assertion utilities for development
 */
export const assert = {
  /**
   * Assert locale is valid
   */
  locale(locale: string): void {
    if (!locale || typeof locale !== 'string') {
      throw new I18nError(
        I18nErrorType.INVALID_LOCALE,
        `Invalid locale: ${locale}`,
        {
          severity: ErrorSeverity.ERROR,
          suggestions: [
            'Locale must be a non-empty string',
            'Use format like "en", "en-US", "zh-CN"',
          ],
        },
      )
    }
  },

  /**
   * Assert key is valid
   */
  key(key: string): void {
    if (!key || typeof key !== 'string') {
      throw new I18nError(
        I18nErrorType.MISSING_KEY,
        `Invalid translation key: ${key}`,
        {
          severity: ErrorSeverity.ERROR,
          suggestions: [
            'Key must be a non-empty string',
            'Use dot notation for nested keys: "page.title"',
          ],
        },
      )
    }
  },

  /**
   * Assert configuration is valid
   */
  config(config: any, requiredFields: string[] = []): void {
    if (!config || typeof config !== 'object') {
      throw new I18nError(
        I18nErrorType.CONFIG_ERROR,
        'Invalid configuration object',
        {
          severity: ErrorSeverity.CRITICAL,
          suggestions: ['Configuration must be an object'],
        },
      )
    }

    for (const field of requiredFields) {
      if (!(field in config)) {
        throw new I18nError(
          I18nErrorType.CONFIG_ERROR,
          `Missing required configuration field: ${field}`,
          {
            severity: ErrorSeverity.CRITICAL,
            context: { config, requiredFields },
          },
        )
      }
    }
  },
}

/**
 * Development-only warning utility
 */
export function warn(message: string, details?: any): void {
  if (typeof window !== 'undefined' && (window as any).__DEV__ === true) {
    console.warn(`[I18n Warning] ${message}`, details || '')
  }
}

/**
 * Development-only info utility
 */
export function info(message: string, details?: any): void {
  if (typeof window !== 'undefined' && (window as any).__DEV__ === true) {
    console.info(`[I18n Info] ${message}`, details || '')
  }
}

/**
 * Create error boundary for components
 */
export function createErrorBoundary(
  componentName: string,
  fallback: any,
): (error: Error) => any {
  return (error: Error) => {
    const i18nError = new I18nError(
      I18nErrorType.PLUGIN_ERROR,
      `Component "${componentName}" encountered an error`,
      {
        severity: ErrorSeverity.ERROR,
        context: { componentName },
        cause: error,
        suggestions: [
          'Check component props are valid',
          'Ensure i18n instance is properly initialized',
          'Review component implementation',
        ],
      },
    );

    (globalErrorHandler as any).logError(i18nError)

    return fallback
  }
}
