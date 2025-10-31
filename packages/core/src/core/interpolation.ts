/**
 * @ldesign/i18n - 插值引擎
 *
 * 处理翻译消息中的参数替换和格式化
 *
 * ## 功能特性
 * - 参数插值: `{{name}}` → 'John'
 * - 格式化支持: `{{date, short}}` → '2024/10/25'
 * - 嵌套翻译: `$t(nested.key)` → 嵌套的翻译结果
 * - HTML 转义: 防止 XSS 攻击
 * - 性能优化: 正则预编译、格式化器缓存
 *
 * @example
 * ```typescript
 * const engine = new InterpolationEngine();
 * engine.interpolate('Hello {{name}}!', { name: 'John' });
 * // 结果: 'Hello John!'
 *
 * engine.interpolate('Price: {{price, currency}}', { price: 99.9 });
 * // 结果: 'Price: $99.90'
 * ```
 */

import type { InterpolationOptions, InterpolationParams, Locale } from '../types'
import { escapeHtml, getNestedValue, isPlainObject } from '../utils/helpers'

/**
 * 插值引擎类
 *
 * 负责将翻译消息中的占位符替换为实际值
 * 支持嵌套路径、格式化、HTML转义等高级功能
 */
export class InterpolationEngine {
  /** 占位符前缀,默认 '{{' */
  private readonly prefix: string
  /** 占位符后缀,默认 '}}' */
  private readonly suffix: string
  /** 是否转义 HTML,默认 true */
  private readonly escapeValue: boolean
  /** 嵌套翻译前缀,默认 '$t(' */
  private readonly nestingPrefix: string
  /** 嵌套翻译后缀,默认 ')' */
  private readonly nestingSuffix: string
  /** 格式分隔符,默认 ',' */
  private readonly formatSeparator: string
  /** 自定义格式化器 */
  private readonly formatter?: (value: any, format?: string, locale?: Locale) => string

  /** 预编译的插值正则表达式(性能优化) */
  private readonly interpolationRegex: RegExp
  /** 预编译的嵌套翻译正则表达式(性能优化) */
  private readonly nestingRegex: RegExp

  /** 格式化结果缓存,避免重复格式化 */
  private readonly formatCache = new Map<string, string>()
  /** 格式化缓存最大容量 */
  private readonly MAX_CACHE_SIZE = 500

  /** 数字格式化器缓存(Intl.NumberFormat 实例) */
  private readonly numberFormatters = new Map<string, Intl.NumberFormat>()
  /** 日期格式化器缓存(Intl.DateTimeFormat 实例) */
  // @ts-ignore - 保留供将来扩展使用
  private readonly dateFormatters = new Map<string, Intl.DateTimeFormat>()
  /** 列表格式化器缓存(Intl.ListFormat 实例) */
  // @ts-ignore - 保留供将来扩展使用
  private readonly listFormatters = new Map<string, any>() // 使用 any 以兼容不同浏览器

  /**
   * 创建插值引擎实例
   *
   * @param options - 插值选项配置
   * @param options.prefix - 占位符前缀,默认 '{{'
   * @param options.suffix - 占位符后缀,默认 '}}'
   * @param options.escapeValue - 是否转义 HTML,默认 true
   * @param options.nestingPrefix - 嵌套翻译前缀,默认 '$t('
   * @param options.nestingSuffix - 嵌套翻译后缀,默认 ')'
   * @param options.formatSeparator - 格式分隔符,默认 ','
   * @param options.formatter - 自定义格式化器函数
   */
  constructor(options: InterpolationOptions | any = {}) {
    this.prefix = options.prefix || '{{'
    this.suffix = options.suffix || '}}'
    this.escapeValue = options.escapeValue !== false
    this.nestingPrefix = options.nestingPrefix || '$t('
    this.nestingSuffix = options.nestingSuffix || ')'
    this.formatSeparator = options.formatSeparator || ','
    this.formatter = options.formatter

    // 预编译正则表达式(性能优化)
    const prefixEscaped = this.escapeRegex(this.prefix)
    const suffixEscaped = this.escapeRegex(this.suffix)
    const nestingPrefixEscaped = this.escapeRegex(this.nestingPrefix)
    const nestingSuffixEscaped = this.escapeRegex(this.nestingSuffix)

    // 使用非贪婪匹配提高性能
    // 匹配: {{...}} 之间的内容
    this.interpolationRegex = new RegExp(
      `${prefixEscaped}(.+?)${suffixEscaped}`,
      'g',
    )
    // 匹配: $t(...) 之间的内容
    this.nestingRegex = new RegExp(
      `${nestingPrefixEscaped}(.+?)${nestingSuffixEscaped}`,
      'g',
    )
  }

  /**
   * 执行参数插值
   *
   * 将消息中的占位符替换为实际参数值
   *
   * ## 处理顺序
   * 1. 先处理嵌套翻译 `$t(key)`
   * 2. 再处理参数插值 `{{param}}`
   *
   * @param message - 包含占位符的消息字符串
   * @param params - 参数对象
   * @param locale - 语言代码,用于格式化
   * @returns 插值后的字符串
   *
   * @example
   * ```typescript
   * interpolate('Hello {{name}}!', { name: 'World' });
   * // 返回: 'Hello World!'
   *
   * interpolate('Welcome {{user.name}}!', { user: { name: 'John' } });
   * // 返回: 'Welcome John!'
   *
   * interpolate('Price: {{price, currency}}', { price: 99.9 }, 'en-US');
   * // 返回: 'Price: $99.90'
   * ```
   */
  interpolate(
    message: string,
    params?: InterpolationParams,
    locale?: Locale,
  ): string {
    if (!params || !isPlainObject(params)) {
      return message
    }

    let result = message

    // 先处理嵌套翻译
    result = this.handleNesting(result, params, locale)

    // 再处理参数插值
    result = this.handleInterpolation(result, params, locale)

    return result
  }

  /**
   * 处理参数插值(带缓存优化)
   *
   * 查找并替换消息中的所有 `{{...}}` 占位符
   *
   * ## 性能优化
   * - 快速路径: 无占位符时直接返回
   * - 格式化缓存: 避免重复格式化相同参数
   * - 嵌套路径支持: `{{user.name}}` 自动解析
   *
   * @param message - 消息字符串
   * @param params - 参数对象
   * @param locale - 语言代码
   * @returns 插值后的字符串
   * @private
   */
  private handleInterpolation(
    message: string,
    params: InterpolationParams,
    locale?: Locale,
  ): string {
    // 快速路径: 没有占位符时直接返回
    if (!message.includes(this.prefix)) {
      return message
    }

    // 重置正则 lastIndex 以便复用
    this.interpolationRegex.lastIndex = 0

    return message.replace(this.interpolationRegex, (match, expression) => {
      const trimmedExpression = expression.trim()

      // 优先检查格式化缓存
      const cacheKey = `${trimmedExpression}:${JSON.stringify(params[trimmedExpression.split(this.formatSeparator)[0].trim()])}:${locale}`
      if (this.formatCache.has(cacheKey)) {
        return this.formatCache.get(cacheKey)!
      }

      // 解析表达式(只解析一次)
      // 格式: path[, format]  例如: 'price, currency'
      const separatorIndex = trimmedExpression.indexOf(this.formatSeparator)
      const path = separatorIndex > -1 ? trimmedExpression.substring(0, separatorIndex).trim() : trimmedExpression
      const format = separatorIndex > -1 ? trimmedExpression.substring(separatorIndex + 1).trim() : undefined

      // 从参数中获取值(优化路径)
      let value = params[path]
      if (value === undefined && path.includes('.')) {
        // 支持嵌套路径 如 'user.profile.name'
        value = getNestedValue(params, path)
      }

      // 处理未定义的值
      if (value === undefined) {
        return match // 值不存在时保留原占位符
      }

      // 应用格式化
      let result: string
      if (format) {
        if (this.formatter) {
          // 使用自定义格式化器
          result = String(this.formatter(value, format, locale))
        }
        else {
          // 使用默认格式化器
          result = this.defaultFormatOptimized(value, format, locale)
        }
      }
      else {
        result = String(value)
      }

      // HTML 转义(如果启用)
      if (this.escapeValue && typeof result === 'string') {
        result = escapeHtml(result)
      }

      // 缓存结果
      if (this.formatCache.size >= this.MAX_CACHE_SIZE) {
        // 简单的 FIFO 驱逐策略
        const firstKey = this.formatCache.keys().next().value
        if (firstKey !== undefined) {
          this.formatCache.delete(firstKey)
        }
      }
      this.formatCache.set(cacheKey, result)

      return result
    })
  }

  /**
   * 处理嵌套翻译
   *
   * 在消息中嵌入其他翻译键的结果
   *
   * @param message - 消息字符串
   * @param params - 参数对象(需包含 $t 翻译函数)
   * @param _locale - 语言代码(未使用,保留以备将来扩展)
   * @returns 嵌套翻译处理后的字符串
   *
   * @example
   * ```typescript
   * // 假设 params.$t('app.name') 返回 'MyApp'
   * handleNesting('Welcome to $t(app.name)!', { $t: translateFn });
   * // 返回: 'Welcome to MyApp!'
   * ```
   *
   * @private
   */
  private handleNesting(
    message: string,
    params: InterpolationParams,
    _locale?: Locale,
  ): string {
    // 重置正则 lastIndex 以便复用
    this.nestingRegex.lastIndex = 0

    return message.replace(this.nestingRegex, (_match, key) => {
      const trimmedKey = key.trim()

      // 检查参数中是否有翻译函数
      if (params.$t && typeof params.$t === 'function') {
        return params.$t(trimmedKey, params)
      }

      // 否则返回键名占位符
      return `[${trimmedKey}]`
    })
  }

  /**
   * Get value from params object (supports nested paths)
   */
  private getValue(params: InterpolationParams, path: string): any {
    // First try direct access
    if (params[path] !== undefined) {
      return params[path]
    }

    // Then try nested path
    return getNestedValue(params, path)
  }

  /**
   * 优化的默认格式化(带缓存)
   *
   * 对数字类型使用缓存的 Intl 格式化器,提高性能
   *
   * @param value - 要格式化的值
   * @param format - 格式类型
   * @param locale - 语言代码
   * @returns 格式化后的字符串
   *
   * @private
   */
  private defaultFormatOptimized(value: any, format: string, locale?: Locale): string {
    // 数字格式化(使用缓存的格式化器)
    if (typeof value === 'number') {
      const formatLower = format.toLowerCase()
      const formatterKey = `${locale}:${formatLower}`

      switch (formatLower) {
        case 'number': {
          let formatter = this.numberFormatters.get(formatterKey)
          if (!formatter) {
            formatter = new Intl.NumberFormat(locale)
            this.numberFormatters.set(formatterKey, formatter)
          }
          return formatter.format(value)
        }
        case 'percent': {
          let formatter = this.numberFormatters.get(formatterKey)
          if (!formatter) {
            formatter = new Intl.NumberFormat(locale, { style: 'percent' })
            this.numberFormatters.set(formatterKey, formatter)
          }
          return formatter.format(value)
        }
        case 'currency': {
          let formatter = this.numberFormatters.get(formatterKey)
          if (!formatter) {
            formatter = new Intl.NumberFormat(locale, {
              style: 'currency',
              currency: 'USD',
            })
            this.numberFormatters.set(formatterKey, formatter)
          }
          return formatter.format(value)
        }
        default: {
          // 检查是否为小数精度格式 (如 "0.00")
          const precision = format.match(/^0\.0+$/)
          if (precision) {
            const decimals = precision[0].length - 2
            return value.toFixed(decimals)
          }
          return String(value)
        }
      }
    }

    return this.defaultFormat(value, format, locale)
  }

  /**
   * Default formatting for common types
   */
  private defaultFormat(value: any, format?: string, locale?: Locale): string {
    if (!format) {
      return String(value)
    }

    // Date formatting
    if (value instanceof Date) {
      switch (format.toLowerCase()) {
        case 'short':
          return new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(value)
        case 'medium':
          return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(value)
        case 'long':
          return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(value)
        case 'full':
          return new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(value)
        case 'time':
          return new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(value)
        case 'datetime':
          return new Intl.DateTimeFormat(locale, {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(value)
        default:
          return new Intl.DateTimeFormat(locale).format(value)
      }
    }

    // Array formatting
    if (Array.isArray(value)) {
      // Check if Intl.ListFormat is available
      if (typeof (Intl as any).ListFormat !== 'undefined') {
        switch (format.toLowerCase()) {
          case 'list':
            return new (Intl as any).ListFormat(locale, { type: 'conjunction' }).format(value)
          case 'or':
            return new (Intl as any).ListFormat(locale, { type: 'disjunction' }).format(value)
          case 'unit':
            return new (Intl as any).ListFormat(locale, { type: 'unit' }).format(value)
          default:
            return value.join(', ')
        }
      }
      else {
        // Fallback for browsers without ListFormat support
        return value.join(', ')
      }
    }

    // String formatting
    if (typeof value === 'string') {
      switch (format.toLowerCase()) {
        case 'upper':
        case 'uppercase':
          return value.toUpperCase()
        case 'lower':
        case 'lowercase':
          return value.toLowerCase()
        case 'capitalize':
          return value.charAt(0).toUpperCase() + value.slice(1)
        case 'title':
          return value.replace(/\w\S*/g, txt =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
        default:
          return value
      }
    }

    return String(value)
  }

  /**
   * Escape regex special characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * 检查消息是否包含插值占位符
   *
   * @param message - 消息字符串
   * @returns 是否包含占位符
   */
  hasPlaceholders(message: string): boolean {
    const regex = new RegExp(
      `${this.escapeRegex(this.prefix)}[^${this.escapeRegex(this.suffix)}]+${this.escapeRegex(this.suffix)}`,
    )
    return regex.test(message)
  }

  /**
   * 从消息中提取所有占位符键名
   *
   * @param message - 消息字符串
   * @returns 占位符键名数组(去重后)
   *
   * @example
   * ```typescript
   * extractPlaceholders('Hello {{name}}, you have {{count}} messages');
   * // 返回: ['name', 'count']
   * ```
   */
  extractPlaceholders(message: string): string[] {
    const regex = new RegExp(
      `${this.escapeRegex(this.prefix)}([^${this.escapeRegex(this.suffix)}]+)${this.escapeRegex(this.suffix)}`,
      'g',
    )

    const placeholders: string[] = []
    for (let m = regex.exec(message); m !== null; m = regex.exec(message)) {
      const expression = m[1].trim()
      const [path] = expression.split(this.formatSeparator).map(s => s.trim())
      placeholders.push(path)
    }

    return Array.from(new Set(placeholders))
  }

  /**
   * 验证所有必需的占位符都有对应的参数值
   *
   * @param message - 消息字符串
   * @param params - 参数对象
   * @returns 是否所有占位符都有值
   */
  validateParams(message: string, params?: InterpolationParams): boolean {
    if (!params)
      return !this.hasPlaceholders(message)

    const placeholders = this.extractPlaceholders(message)

    for (const placeholder of placeholders) {
      if (this.getValue(params, placeholder) === undefined) {
        return false
      }
    }

    return true
  }
}
