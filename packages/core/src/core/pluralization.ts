/**
 * @ldesign/i18n - 复数化引擎
 *
 * 根据不同语言的复数规则处理复数形式
 * 基于 Unicode CLDR (Common Locale Data Repository) 规范
 *
 * ## 功能
 * - 支持 20+ 种语言的复数规则
 * - 自动选择正确的复数形式
 * - 缓存复数类别提高性能
 * - 支持自定义复数规则
 *
 * @see https://cldr.unicode.org/index/cldr-spec/plural-rules
 */

// import type { Locale, PluralRule } from '../types';
import { parseLocale } from '../utils/helpers'

// 类型定义
type Locale = string
type PluralRule = (count: number, locale?: string) => string

/**
 * CLDR 定义的复数类别
 *
 * - zero: 零(阿拉伯语等)
 * - one: 单数
 * - two: 双数(阿拉伯语、希伯来语等)
 * - few: 少数(俄语、波兰语等)
 * - many: 多数(俄语、阿拉伯语等)
 * - other: 其他(默认形式)
 */
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'

/**
 * 不同语言的复数规则
 *
 * 基于 Unicode CLDR 复数规则实现
 *
 * @see https://unicode-org.github.io/cldr-staging/charts/37/supplemental/language_plural_rules.html
 */
const PLURAL_RULES: Record<string, PluralRule> = {
  // 中文、日文、韩文 - 无复数形式
  // 规则: 始终使用 'other'
  zh: () => 'other',
  ja: () => 'other',
  ko: () => 'other',

  // 英语、德语、荷兰语、意大利语、西班牙语
  // 规则: n=1 使用 'one', 其他使用 'other'
  en: (count: number) => count === 1 ? 'one' : 'other',
  de: (count: number) => count === 1 ? 'one' : 'other',
  nl: (count: number) => count === 1 ? 'one' : 'other',
  it: (count: number) => count === 1 ? 'one' : 'other',
  es: (count: number) => count === 1 ? 'one' : 'other',

  // 葡萄牙语
  // 规则: n=0 或 n=1 使用 'one', 其他使用 'other'
  pt: (count: number) => count === 0 || count === 1 ? 'one' : 'other',

  // 法语
  // 规则: n=0 或 n=1 使用 'one', 其他使用 'other'
  fr: (count: number) => count === 0 || count === 1 ? 'one' : 'other',

  // 俄语、乌克兰语
  // 规则: 复杂的三分类
  // - one: n%10=1 且 n%100≠11 (1, 21, 31, ...)
  // - few: n%10∈{2,3,4} 且 n%100∉{12,13,14} (2-4, 22-24, ...)
  // - many: 其他 (0, 5-20, 25-30, ...)
  ru: (count: number) => {
    const mod10 = count % 10
    const mod100 = count % 100

    if (mod10 === 1 && mod100 !== 11)
      return 'one'
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
      return 'few'
    return 'many'
  },
  uk: (count: number) => {
    const mod10 = count % 10
    const mod100 = count % 100

    if (mod10 === 1 && mod100 !== 11)
      return 'one'
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
      return 'few'
    return 'many'
  },

  // 波兰语
  // 规则: 三分类
  // - one: n=1
  // - few: n%10∈{2,3,4} 且 n%100∉{12,13,14}
  // - many: 其他
  pl: (count: number) => {
    if (count === 1)
      return 'one'
    const mod10 = count % 10
    const mod100 = count % 100

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
      return 'few'
    return 'many'
  },

  // 捷克语、斯洛伐克语
  // 规则: 三分类
  // - one: n=1
  // - few: n∈{2,3,4}
  // - other: 其他
  cs: (count: number) => {
    if (count === 1)
      return 'one'
    if (count >= 2 && count <= 4)
      return 'few'
    return 'other'
  },
  sk: (count: number) => {
    if (count === 1)
      return 'one'
    if (count >= 2 && count <= 4)
      return 'few'
    return 'other'
  },

  // 阿拉伯语
  // 规则: 六分类(最复杂的复数系统)
  // - zero: n=0
  // - one: n=1
  // - two: n=2
  // - few: n%100∈{3..10}
  // - many: n%100∈{11..99}
  // - other: 其他
  ar: (count: number) => {
    if (count === 0)
      return 'zero'
    if (count === 1)
      return 'one'
    if (count === 2)
      return 'two'
    const mod100 = count % 100
    if (mod100 >= 3 && mod100 <= 10)
      return 'few'
    if (mod100 >= 11 && mod100 <= 99)
      return 'many'
    return 'other'
  },

  // 希伯来语
  // 规则: 四分类
  // - one: n=1
  // - two: n=2
  // - many: n>10 且 n%10=0 (10, 20, 30, ...)
  // - other: 其他
  he: (count: number) => {
    if (count === 1)
      return 'one'
    if (count === 2)
      return 'two'
    if (count > 10 && count % 10 === 0)
      return 'many'
    return 'other'
  },

  // 土耳其语、阿塞拜疆语
  // 规则: 无复数形式,始终使用 'other'
  tr: () => 'other',
  az: () => 'other',

  // 印地语
  // 规则: n=0 或 n=1 使用 'one', 其他使用 'other'
  hi: (count: number) => count === 0 || count === 1 ? 'one' : 'other',
}

/**
 * 复数化引擎
 *
 * 根据 CLDR 规则自动选择正确的复数形式
 *
 * ## 使用示例
 * ```typescript
 * const engine = new PluralizationEngine();
 *
 * // 英语: 1 item, 2 items
 * engine.getCategory(1, 'en'); // 'one'
 * engine.getCategory(2, 'en'); // 'other'
 *
 * // 俄语: 1 яблоко, 2 яблока, 5 яблок
 * engine.getCategory(1, 'ru'); // 'one'
 * engine.getCategory(2, 'ru'); // 'few'
 * engine.getCategory(5, 'ru'); // 'many'
 * ```
 */
export class PluralizationEngine {
  /** 语言复数规则映射表 */
  private readonly rules = new Map<string, PluralRule>()
  /** 默认规则(总是返回 'other') */
  private readonly defaultRule: PluralRule = () => 'other'
  /** 复数形式分隔符 */
  // @ts-ignore - 保留供将来使用
  private readonly separator: string

  /** 复数类别缓存(性能优化) */
  private readonly categoryCache = new Map<string, PluralCategory>()
  /** 缓存最大容量 */
  private readonly CACHE_MAX_SIZE = 1000

  /**
   * 创建复数化引擎实例
   *
   * @param separator - 复数形式分隔符,默认 '_'
   */
  constructor(separator = '_') {
    // @ts-ignore - separator 保留供将来使用
    this.separator = separator
    this.loadBuiltInRules()
  }

  /**
   * 加载内置的复数规则
   *
   * 从 PLURAL_RULES 常量加载所有支持的语言规则
   * @private
   */
  private loadBuiltInRules(): void {
    Object.entries(PLURAL_RULES).forEach(([locale, rule]) => {
      this.rules.set(locale, rule)
    })
  }

  /**
   * 添加自定义复数规则
   *
   * 允许覆盖内置规则或添加新语言支持
   *
   * @param locale - 语言代码
   * @param rule - 复数规则函数
   *
   * @example
   * ```typescript
   * engine.addRule('custom', (count) => {
   *   return count > 10 ? 'many' : 'few';
   * });
   * ```
   */
  addRule(locale: Locale, rule: PluralRule): void {
    const { language } = parseLocale(locale)
    this.rules.set(language, rule)
  }

  /**
   * 获取语言的复数规则
   *
   * @param locale - 语言代码
   * @returns 复数规则函数,如果不存在则返回默认规则
   */
  getRule(locale: Locale): PluralRule {
    const { language } = parseLocale(locale)
    return this.rules.get(language) || this.defaultRule
  }

  /**
   * 获取数量对应的复数类别
   *
   * 根据语言规则和数量确定使用哪个复数形式
   *
   * ## 性能优化
   * - 结果缓存,避免重复计算
   * - 缓存容量限制,防止内存泄漏
   *
   * @param count - 数量
   * @param locale - 语言代码
   * @returns 复数类别 (zero/one/two/few/many/other)
   *
   * @example
   * ```typescript
   * getCategory(1, 'en');   // 'one'
   * getCategory(2, 'en');   // 'other'
   * getCategory(1, 'ru');   // 'one'
   * getCategory(2, 'ru');   // 'few'
   * getCategory(5, 'ru');   // 'many'
   * ```
   */
  getCategory(count: number, locale: Locale): PluralCategory {
    // 优先检查缓存
    const cacheKey = `${locale}:${count}`
    let category = this.categoryCache.get(cacheKey)

    if (category === undefined) {
      const rule = this.getRule(locale)
      category = rule(count, locale) as PluralCategory

      // 添加到缓存(带容量限制)
      if (this.categoryCache.size < this.CACHE_MAX_SIZE) {
        this.categoryCache.set(cacheKey, category)
      }
    }

    return category
  }

  /**
   * 从消息对象中选择合适的复数形式
   *
   * 选择策略(按优先级):
   * 1. 精确匹配复数类别 (如 'one', 'few')
   * 2. 精确匹配数量 (如 '0', '1', '2')
   * 3. 降级链: other → many → few → two → one → zero
   * 4. 第一个可用的形式
   *
   * @param messages - 复数消息对象或字符串
   * @param count - 数量
   * @param locale - 语言代码
   * @returns 选中的复数形式字符串
   *
   * @example
   * ```typescript
   * const messages = {
   *   one: '1 item',
   *   other: '{{count}} items'
   * };
   * selectPlural(messages, 1, 'en');  // '1 item'
   * selectPlural(messages, 5, 'en');  // '{{count}} items'
   * ```
   */
  selectPlural(
    messages: Record<string, string> | string,
    count: number,
    locale: Locale,
  ): string {
    // 如果是简单字符串,直接返回
    if (typeof messages === 'string') {
      return messages
    }

    const category = this.getCategory(count, locale)

    // 尝试精确匹配复数类别
    if (messages[category]) {
      return messages[category]
    }

    // 尝试数量特定形式 (如 "0", "1", "2")
    if (messages[String(count)]) {
      return messages[String(count)]
    }

    // 降级链(按优先级从高到低)
    const fallbackChain: PluralCategory[] = ['other', 'many', 'few', 'two', 'one', 'zero']
    for (const fallback of fallbackChain) {
      if (messages[fallback]) {
        return messages[fallback]
      }
    }

    // 如果都没找到,返回第一个可用的形式
    const keys = Object.keys(messages)
    return keys.length > 0 ? messages[keys[0]] : ''
  }

  /**
   * 解析复数消息字符串为表单对象
   *
   * 支持两种格式:
   * - 类别格式: "one:item|few:items|other:items"
   * - 数量格式: "0:no items|1:one item|other:{{count}} items"
   *
   * @param message - 复数消息字符串
   * @param separator - 分隔符,默认 '|'
   * @returns 复数表单对象
   *
   * @example
   * ```typescript
   * parsePluralString('one:apple|other:apples');
   * // 返回: { one: 'apple', other: 'apples' }
   *
   * parsePluralString('0:no items|1:one item|other:{{count}} items');
   * // 返回: { '0': 'no items', '1': 'one item', other: '{{count}} items' }
   * ```
   */
  parsePluralString(message: string, separator = '|'): Record<string, string> {
    const forms: Record<string, string> = {}
    const parts = message.split(separator)

    for (const part of parts) {
      const colonIndex = part.indexOf(':')
      if (colonIndex > 0) {
        const key = part.substring(0, colonIndex).trim()
        const value = part.substring(colonIndex + 1).trim()
        forms[key] = value
      }
      else {
        // 如果没有指定键,视为 "other"
        forms.other = part.trim()
      }
    }

    return forms
  }

  /**
   * 格式化复数消息
   *
   * 选择正确的复数形式并替换占位符
   *
   * @param message - 复数消息字符串或对象
   * @param count - 数量
   * @param locale - 语言代码
   * @param params - 额外的参数对象(可选)
   * @returns 格式化后的字符串
   *
   * @example
   * ```typescript
   * format('one:apple|other:apples', 1, 'en');
   * // 返回: 'apple'
   *
   * format({ one: '{{count}} item', other: '{{count}} items' }, 5, 'en');
   * // 返回: '5 items'
   * ```
   */
  format(
    message: string | Record<string, string>,
    count: number,
    locale: Locale,
    params?: Record<string, any>,
  ): string {
    // 如果是字符串且包含分隔符,先解析
    const messages = typeof message === 'string' && message.includes('|')
      ? this.parsePluralString(message)
      : message

    // 选择合适的复数形式
    const selected = this.selectPlural(messages, count, locale)

    // 替换数量占位符
    let result = selected.replace(/\{\{count\}\}/g, String(count))
    result = result.replace(/\{\{n\}\}/g, String(count))

    // 替换其他参数
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
        result = result.replace(regex, String(value))
      })
    }

    return result
  }

  /**
   * 检查消息是否包含复数形式
   *
   * @param message - 消息字符串
   * @param separator - 分隔符,默认 '|'
   * @returns 是否包含复数形式
   */
  hasPluralForms(message: string, separator = '|'): boolean {
    if (!message || typeof message !== 'string')
      return false

    // 检查基于分隔符的格式
    if (message.includes(separator)) {
      const parts = message.split(separator)
      return parts.some(part => part.includes(':'))
    }

    return false
  }

  /**
   * 从消息中提取所有复数形式
   *
   * @param message - 消息字符串
   * @param separator - 分隔符,默认 '|'
   * @returns 复数形式数组
   */
  extractPluralForms(message: string, separator = '|'): string[] {
    if (!this.hasPluralForms(message, separator)) {
      return [message]
    }

    const forms = this.parsePluralString(message, separator)
    return Object.values(forms)
  }

  /**
   * 验证复数形式的完整性
   *
   * 检查是否至少有 'other' 形式或数字形式作为降级
   *
   * @param message - 复数消息字符串或对象
   * @param locale - 语言代码
   * @returns 是否有效
   */
  validatePluralForms(
    message: string | Record<string, string>,
    // @ts-ignore - locale 参数保留供将来扩展
    locale: Locale,
  ): boolean {
    const messages = typeof message === 'string'
      ? this.parsePluralString(message)
      : message

    // 必须至少有 "other" 形式
    if (!messages.other && Object.keys(messages).length > 0) {
      // 检查是否有数字形式可以作为降级
      return Object.keys(messages).some(key => !Number.isNaN(Number(key)))
    }

    return true
  }

  /**
   * 获取语言支持的复数类别
   *
   * 返回该语言可能使用的所有复数类别
   *
   * @param locale - 语言代码
   * @returns 支持的复数类别数组
   *
   * @example
   * ```typescript
   * getSupportedCategories('en');  // ['one', 'other']
   * getSupportedCategories('ru');  // ['one', 'few', 'many']
   * getSupportedCategories('ar');  // ['zero', 'one', 'two', 'few', 'many', 'other']
   * ```
   */
  getSupportedCategories(locale: Locale): PluralCategory[] {
    const { language } = parseLocale(locale)

    // Special cases for languages with specific plural forms
    switch (language) {
      case 'zh':
      case 'ja':
      case 'ko':
      case 'tr':
      case 'az':
        return ['other']

      case 'en':
      case 'de':
      case 'nl':
      case 'it':
      case 'es':
      case 'pt':
      case 'fr':
      case 'hi':
        return ['one', 'other']

      case 'ru':
      case 'uk':
      case 'pl':
        return ['one', 'few', 'many']

      case 'cs':
      case 'sk':
        return ['one', 'few', 'other']

      case 'ar':
        return ['zero', 'one', 'two', 'few', 'many', 'other']

      case 'he':
        return ['one', 'two', 'many', 'other']

      default:
        return ['one', 'other']
    }
  }
}
