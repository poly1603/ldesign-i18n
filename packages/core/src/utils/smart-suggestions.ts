/**
 * @ldesign/i18n - Smart Suggestions
 * 智能翻译建议：上下文建议、相似键名推荐、命名规范检查
 *
 * @version 1.0.0
 * @author LDesign Team
 */

import type { I18nInstance, Locale, Messages } from '../types'

// ==================== 类型定义 ====================

/**
 * 建议类型
 */
export type SuggestionType =
  | 'similar_key'      // 相似键名
  | 'naming_fix'       // 命名修正
  | 'common_pattern'   // 常用模式
  | 'context_based'    // 基于上下文
  | 'prefix_match'     // 前缀匹配

/**
 * 单个建议
 */
export interface Suggestion {
  /** 建议类型 */
  type: SuggestionType
  /** 建议的键名 */
  suggestedKey: string
  /** 置信度 (0-1) */
  confidence: number
  /** 原因说明 */
  reason: string
  /** 示例翻译值 */
  exampleValue?: string
  /** 来源键（如果是基于已有键） */
  sourceKey?: string
}

/**
 * 命名规范检查结果
 */
export interface NamingCheckResult {
  /** 原始键名 */
  originalKey: string
  /** 是否符合规范 */
  isValid: boolean
  /** 问题列表 */
  issues: string[]
  /** 修正建议 */
  suggestions: string[]
  /** 推荐的键名 */
  recommendedKey?: string
}

/**
 * 翻译模式统计
 */
export interface PatternStats {
  /** 模式名称 */
  pattern: string
  /** 出现次数 */
  count: number
  /** 示例键 */
  examples: string[]
}

/**
 * 翻译建议上下文信息
 */
export interface SuggestionContext {
  /** 命名空间 */
  namespace?: string
  /** 父级键 */
  parentKey?: string
  /** 相关键 */
  relatedKeys?: string[]
  /** 使用场景 */
  usage?: 'ui' | 'message' | 'error' | 'label' | 'placeholder' | 'title'
}

/**
 * 智能建议配置
 */
export interface SmartSuggestionsConfig {
  /** 命名规范 */
  namingConvention?: 'camelCase' | 'snake_case' | 'kebab-case' | 'dot.case'
  /** 最大建议数量 */
  maxSuggestions?: number
  /** 最小相似度阈值 */
  minSimilarity?: number
  /** 是否学习翻译模式 */
  learnPatterns?: boolean
  /** 常用前缀列表 */
  commonPrefixes?: string[]
  /** 常用后缀列表 */
  commonSuffixes?: string[]
}

// ==================== 工具函数 ====================

/**
 * 计算 Levenshtein 距离
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * 计算相似度 (0-1)
 */
function calculateSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase())
  return 1 - distance / maxLen
}

/**
 * 获取所有嵌套键
 */
function getAllKeys(messages: Messages, prefix = ''): string[] {
  const keys: string[] = []

  for (const key in messages) {
    if (Object.prototype.hasOwnProperty.call(messages, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const value = messages[key]

      if (typeof value === 'string') {
        keys.push(fullKey)
      } else if (typeof value === 'object' && value !== null) {
        keys.push(...getAllKeys(value as Messages, fullKey))
      }
    }
  }

  return keys
}

/**
 * 获取嵌套值
 */
function getNestedValue(obj: Messages, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = obj

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }

  return typeof current === 'string' ? current : undefined
}

/**
 * 转换为 camelCase
 */
function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s.]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, c => c.toLowerCase())
}

/**
 * 转换为 snake_case
 */
function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[-\s.]+/g, '_')
    .toLowerCase()
    .replace(/^_/, '')
}

/**
 * 转换为 kebab-case
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/[_\s.]+/g, '-')
    .toLowerCase()
    .replace(/^-/, '')
}

/**
 * 转换为 dot.case
 */
function toDotCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '.$1')
    .replace(/[-_\s]+/g, '.')
    .toLowerCase()
    .replace(/^\./, '')
}

/**
 * 提取键的各部分
 */
function extractKeyParts(key: string): string[] {
  return key
    .split(/[.\-_]/)
    .filter(Boolean)
    .map(part => part.toLowerCase())
}

/**
 * 获取公共前缀
 */
function getCommonPrefix(keys: string[]): string {
  if (keys.length === 0) return ''
  if (keys.length === 1) return keys[0].split('.').slice(0, -1).join('.')

  const parts = keys.map(k => k.split('.'))
  const minLen = Math.min(...parts.map(p => p.length))

  let commonParts: string[] = []
  for (let i = 0; i < minLen - 1; i++) {
    const part = parts[0][i]
    if (parts.every(p => p[i] === part)) {
      commonParts.push(part)
    } else {
      break
    }
  }

  return commonParts.join('.')
}

// ==================== 主类 ====================

/**
 * 智能翻译建议器
 *
 * 提供基于上下文的翻译键建议、命名规范检查和修正建议。
 *
 * @example
 * ```typescript
 * const suggestions = new SmartSuggestions(i18n, {
 *   namingConvention: 'camelCase',
 *   maxSuggestions: 5
 * })
 *
 * // 获取相似键建议
 * const similar = suggestions.getSimilarKeys('usr.profile')
 *
 * // 检查命名规范
 * const check = suggestions.checkNaming('User_Profile')
 *
 * // 获取上下文建议
 * const contextual = suggestions.getContextualSuggestions('title', {
 *   namespace: 'user',
 *   usage: 'title'
 * })
 * ```
 */
export class SmartSuggestions {
  private readonly i18n: I18nInstance
  private readonly config: Required<SmartSuggestionsConfig>

  /** 已学习的模式 */
  private learnedPatterns: Map<string, PatternStats> = new Map()
  /** 键缓存 */
  private keysCache: Map<Locale, string[]> = new Map()

  /**
   * 创建智能建议器实例
   *
   * @param i18n - I18n 实例
   * @param config - 配置选项
   */
  constructor(i18n: I18nInstance, config: SmartSuggestionsConfig = {}) {
    this.i18n = i18n
    this.config = {
      namingConvention: config.namingConvention ?? 'camelCase',
      maxSuggestions: config.maxSuggestions ?? 5,
      minSimilarity: config.minSimilarity ?? 0.5,
      learnPatterns: config.learnPatterns ?? true,
      commonPrefixes: config.commonPrefixes ?? [
        'common', 'ui', 'message', 'error', 'label', 'button',
        'title', 'placeholder', 'hint', 'action', 'status'
      ],
      commonSuffixes: config.commonSuffixes ?? [
        'title', 'label', 'message', 'error', 'success', 'warning',
        'hint', 'placeholder', 'button', 'link', 'text'
      ],
    }

    if (this.config.learnPatterns) {
      this.learnFromExisting()
    }
  }

  // ==================== 相似键建议 ====================

  /**
   * 获取相似键名建议
   *
   * @param query - 查询的键名
   * @param locale - 目标语言（可选）
   * @returns 建议列表
   */
  getSimilarKeys(query: string, locale?: Locale): Suggestion[] {
    const targetLocale = locale || this.i18n.locale
    const allKeys = this.getAllKeysForLocale(targetLocale)
    const messages = this.i18n.getMessages(targetLocale)

    const suggestions: Suggestion[] = []
    const queryParts = extractKeyParts(query)

    for (const key of allKeys) {
      const similarity = calculateSimilarity(query, key)

      if (similarity >= this.config.minSimilarity) {
        suggestions.push({
          type: 'similar_key',
          suggestedKey: key,
          confidence: similarity,
          reason: `与 "${query}" 相似度 ${Math.round(similarity * 100)}%`,
          exampleValue: messages ? getNestedValue(messages, key) : undefined,
          sourceKey: key,
        })
      }

      // 也检查部分匹配
      const keyParts = extractKeyParts(key)
      const partMatch = queryParts.some(qp =>
        keyParts.some(kp => kp.includes(qp) || qp.includes(kp))
      )

      if (partMatch && similarity < this.config.minSimilarity) {
        const partSimilarity = 0.3 + similarity * 0.5
        suggestions.push({
          type: 'similar_key',
          suggestedKey: key,
          confidence: partSimilarity,
          reason: `包含相似词根`,
          exampleValue: messages ? getNestedValue(messages, key) : undefined,
          sourceKey: key,
        })
      }
    }

    return this.sortAndLimit(suggestions)
  }

  /**
   * 基于前缀获取建议
   *
   * @param prefix - 前缀
   * @param locale - 目标语言（可选）
   * @returns 建议列表
   */
  getByPrefix(prefix: string, locale?: Locale): Suggestion[] {
    const targetLocale = locale || this.i18n.locale
    const allKeys = this.getAllKeysForLocale(targetLocale)
    const messages = this.i18n.getMessages(targetLocale)

    const suggestions: Suggestion[] = allKeys
      .filter(key => key.startsWith(prefix))
      .map(key => ({
        type: 'prefix_match' as SuggestionType,
        suggestedKey: key,
        confidence: 0.9,
        reason: `以 "${prefix}" 开头`,
        exampleValue: messages ? getNestedValue(messages, key) : undefined,
        sourceKey: key,
      }))

    return this.sortAndLimit(suggestions)
  }

  // ==================== 命名规范 ====================

  /**
   * 检查键名是否符合命名规范
   *
   * @param key - 要检查的键名
   * @returns 检查结果
   */
  checkNaming(key: string): NamingCheckResult {
    const issues: string[] = []
    const suggestions: string[] = []

    // 检查基本规则
    if (key.startsWith('.') || key.endsWith('.')) {
      issues.push('键名不应以点号开始或结束')
      suggestions.push('移除开头或结尾的点号')
    }

    if (key.includes('..')) {
      issues.push('键名不应包含连续的点号')
      suggestions.push('移除多余的点号')
    }

    if (/\s/.test(key)) {
      issues.push('键名不应包含空格')
      suggestions.push('使用分隔符替代空格')
    }

    if (/[A-Z]{2,}/.test(key) && this.config.namingConvention !== 'snake_case') {
      issues.push('避免使用连续大写字母')
      suggestions.push('使用适当的大小写格式')
    }

    // 检查命名约定
    const parts = key.split('.')
    for (const part of parts) {
      if (this.config.namingConvention === 'camelCase') {
        if (!/^[a-z][a-zA-Z0-9]*$/.test(part)) {
          issues.push(`部分 "${part}" 不符合 camelCase 规范`)
          suggestions.push(`建议改为 "${toCamelCase(part)}"`)
        }
      } else if (this.config.namingConvention === 'snake_case') {
        if (!/^[a-z][a-z0-9_]*$/.test(part)) {
          issues.push(`部分 "${part}" 不符合 snake_case 规范`)
          suggestions.push(`建议改为 "${toSnakeCase(part)}"`)
        }
      } else if (this.config.namingConvention === 'kebab-case') {
        if (!/^[a-z][a-z0-9-]*$/.test(part)) {
          issues.push(`部分 "${part}" 不符合 kebab-case 规范`)
          suggestions.push(`建议改为 "${toKebabCase(part)}"`)
        }
      }
    }

    // 生成推荐键名
    let recommendedKey: string | undefined
    if (issues.length > 0) {
      recommendedKey = this.normalizeKey(key)
    }

    return {
      originalKey: key,
      isValid: issues.length === 0,
      issues,
      suggestions,
      recommendedKey,
    }
  }

  /**
   * 规范化键名
   *
   * @param key - 原始键名
   * @returns 规范化后的键名
   */
  normalizeKey(key: string): string {
    // 清理基本问题
    let normalized = key
      .replace(/\s+/g, '.')
      .replace(/\.{2,}/g, '.')
      .replace(/^\.+|\.+$/g, '')

    // 按命名约定转换
    const parts = normalized.split('.')
    const convertedParts = parts.map(part => {
      switch (this.config.namingConvention) {
        case 'camelCase':
          return toCamelCase(part)
        case 'snake_case':
          return toSnakeCase(part)
        case 'kebab-case':
          return toKebabCase(part)
        case 'dot.case':
          return toDotCase(part)
        default:
          return part
      }
    })

    return convertedParts.join('.')
  }

  /**
   * 批量检查命名规范
   *
   * @param keys - 键名列表
   * @returns 检查结果列表
   */
  checkNamingBatch(keys: string[]): NamingCheckResult[] {
    return keys.map(key => this.checkNaming(key))
  }

  // ==================== 上下文建议 ====================

  /**
   * 获取基于上下文的建议
   *
   * @param partialKey - 部分键名
   * @param context - 上下文信息
   * @returns 建议列表
   */
  getContextualSuggestions(
    partialKey: string,
    context: SuggestionContext = {}
  ): Suggestion[] {
    const suggestions: Suggestion[] = []

    // 基于命名空间建议
    if (context.namespace) {
      const prefix = context.namespace
      suggestions.push(...this.generatePrefixedSuggestions(partialKey, prefix))
    }

    // 基于父级键建议
    if (context.parentKey) {
      suggestions.push(...this.generatePrefixedSuggestions(partialKey, context.parentKey))
    }

    // 基于使用场景建议
    if (context.usage) {
      suggestions.push(...this.generateUsageBasedSuggestions(partialKey, context.usage))
    }

    // 基于相关键建议
    if (context.relatedKeys && context.relatedKeys.length > 0) {
      const commonPrefix = getCommonPrefix(context.relatedKeys)
      if (commonPrefix) {
        suggestions.push(...this.generatePrefixedSuggestions(partialKey, commonPrefix))
      }
    }

    // 基于学习的模式建议
    suggestions.push(...this.generatePatternBasedSuggestions(partialKey))

    return this.sortAndLimit(suggestions)
  }

  /**
   * 生成带前缀的建议
   */
  private generatePrefixedSuggestions(partialKey: string, prefix: string): Suggestion[] {
    const suggestions: Suggestion[] = []
    const normalized = this.normalizeKey(partialKey)

    // 直接组合
    const combined = `${prefix}.${normalized}`
    suggestions.push({
      type: 'context_based',
      suggestedKey: combined,
      confidence: 0.8,
      reason: `基于前缀 "${prefix}"`,
    })

    // 常用后缀组合
    for (const suffix of this.config.commonSuffixes) {
      if (partialKey.toLowerCase().includes(suffix.toLowerCase())) {
        suggestions.push({
          type: 'common_pattern',
          suggestedKey: `${prefix}.${normalized}`,
          confidence: 0.7,
          reason: `匹配常用模式 "${suffix}"`,
        })
        break
      }
    }

    return suggestions
  }

  /**
   * 生成基于使用场景的建议
   */
  private generateUsageBasedSuggestions(
    partialKey: string,
    usage: SuggestionContext['usage']
  ): Suggestion[] {
    const suggestions: Suggestion[] = []
    const normalized = this.normalizeKey(partialKey)

    const usagePrefix: Record<NonNullable<SuggestionContext['usage']>, string> = {
      ui: 'ui',
      message: 'message',
      error: 'error',
      label: 'label',
      placeholder: 'placeholder',
      title: 'title',
    }

    const prefix = usagePrefix[usage!]
    if (prefix) {
      suggestions.push({
        type: 'context_based',
        suggestedKey: `${prefix}.${normalized}`,
        confidence: 0.75,
        reason: `适用于 ${usage} 场景`,
      })
    }

    return suggestions
  }

  /**
   * 生成基于学习模式的建议
   */
  private generatePatternBasedSuggestions(partialKey: string): Suggestion[] {
    const suggestions: Suggestion[] = []
    const keyParts = extractKeyParts(partialKey)

    for (const [pattern, stats] of this.learnedPatterns) {
      // 检查是否匹配某个学习到的模式
      if (keyParts.some(part => pattern.includes(part))) {
        const example = stats.examples[0]
        if (example) {
          const exampleParts = example.split('.')
          const suggested = [...exampleParts.slice(0, -1), this.normalizeKey(partialKey)].join('.')

          suggestions.push({
            type: 'common_pattern',
            suggestedKey: suggested,
            confidence: Math.min(0.6 + stats.count * 0.05, 0.85),
            reason: `基于常用模式（出现 ${stats.count} 次）`,
            sourceKey: example,
          })
        }
      }
    }

    return suggestions
  }

  // ==================== 模式学习 ====================

  /**
   * 从现有翻译中学习模式
   */
  learnFromExisting(): void {
    const locale = this.i18n.locale
    const messages = this.i18n.getMessages(locale)

    if (!messages) return

    const allKeys = getAllKeys(messages)
    this.learnedPatterns.clear()

    // 统计前缀模式
    const prefixCounts = new Map<string, { count: number; examples: string[] }>()

    for (const key of allKeys) {
      const parts = key.split('.')
      if (parts.length >= 2) {
        const prefix = parts[0]

        if (!prefixCounts.has(prefix)) {
          prefixCounts.set(prefix, { count: 0, examples: [] })
        }

        const entry = prefixCounts.get(prefix)!
        entry.count++
        if (entry.examples.length < 3) {
          entry.examples.push(key)
        }
      }
    }

    // 保存有意义的模式
    for (const [pattern, data] of prefixCounts) {
      if (data.count >= 3) {
        this.learnedPatterns.set(pattern, {
          pattern,
          count: data.count,
          examples: data.examples,
        })
      }
    }
  }

  /**
   * 获取学习到的模式统计
   */
  getLearnedPatterns(): PatternStats[] {
    return Array.from(this.learnedPatterns.values())
      .sort((a, b) => b.count - a.count)
  }

  // ==================== 自动补全 ====================

  /**
   * 获取自动补全建议
   *
   * @param input - 用户输入
   * @param locale - 目标语言（可选）
   * @returns 补全建议列表
   */
  getAutocompleteSuggestions(input: string, locale?: Locale): Suggestion[] {
    const targetLocale = locale || this.i18n.locale
    const allKeys = this.getAllKeysForLocale(targetLocale)
    const messages = this.i18n.getMessages(targetLocale)

    const suggestions: Suggestion[] = []
    const inputLower = input.toLowerCase()

    for (const key of allKeys) {
      const keyLower = key.toLowerCase()

      // 前缀匹配
      if (keyLower.startsWith(inputLower)) {
        suggestions.push({
          type: 'prefix_match',
          suggestedKey: key,
          confidence: 0.95,
          reason: '前缀匹配',
          exampleValue: messages ? getNestedValue(messages, key) : undefined,
        })
      }
      // 包含匹配
      else if (keyLower.includes(inputLower)) {
        suggestions.push({
          type: 'similar_key',
          suggestedKey: key,
          confidence: 0.7,
          reason: '包含匹配',
          exampleValue: messages ? getNestedValue(messages, key) : undefined,
        })
      }
    }

    return this.sortAndLimit(suggestions)
  }

  // ==================== 内部方法 ====================

  /**
   * 获取指定语言的所有键（带缓存）
   */
  private getAllKeysForLocale(locale: Locale): string[] {
    if (!this.keysCache.has(locale)) {
      const messages = this.i18n.getMessages(locale)
      this.keysCache.set(locale, messages ? getAllKeys(messages) : [])
    }
    return this.keysCache.get(locale)!
  }

  /**
   * 排序并限制建议数量
   */
  private sortAndLimit(suggestions: Suggestion[]): Suggestion[] {
    // 去重
    const seen = new Set<string>()
    const unique = suggestions.filter(s => {
      if (seen.has(s.suggestedKey)) return false
      seen.add(s.suggestedKey)
      return true
    })

    // 按置信度排序并限制数量
    return unique
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.config.maxSuggestions)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.keysCache.clear()
  }

  /**
   * 刷新（重新学习模式并清除缓存）
   */
  refresh(): void {
    this.clearCache()
    if (this.config.learnPatterns) {
      this.learnFromExisting()
    }
  }
}

/**
 * 创建智能建议器实例
 *
 * @param i18n - I18n 实例
 * @param config - 配置选项
 * @returns 智能建议器实例
 */
export function createSmartSuggestions(
  i18n: I18nInstance,
  config?: SmartSuggestionsConfig
): SmartSuggestions {
  return new SmartSuggestions(i18n, config)
}
