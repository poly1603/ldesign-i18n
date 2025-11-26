/**
 * @ldesign/i18n - Key Finder
 * 翻译键查找工具，支持模糊搜索和通配符查询
 */

import type { Messages, Locale } from '../types'

/**
 * 搜索结果
 */
export interface SearchResult {
  /** 键名 */
  key: string
  /** 值 */
  value: string
  /** 语言 */
  locale: Locale
  /** 命名空间 */
  namespace?: string
  /** 相似度分数（0-1，越高越相似） */
  score?: number
}

/**
 * 搜索选项
 */
export interface SearchOptions {
  /** 是否区分大小写 */
  caseSensitive?: boolean
  /** 最大结果数 */
  maxResults?: number
  /** 最小相似度阈值（0-1） */
  minScore?: number
  /** 是否搜索值内容 */
  searchValues?: boolean
}

/**
 * 翻译键查找器
 * 
 * 提供强大的键查找功能：
 * - 模糊搜索（Levenshtein 距离算法）
 * - 通配符查询（支持 * 和 ?）
 * - 精确匹配
 * - 前缀/后缀搜索
 * 
 * @example
 * ```typescript
 * const finder = new KeyFinder();
 * 
 * // 模糊搜索
 * const results = finder.fuzzySearch('app.titel', messages, 'zh-CN');
 * // 可能返回: [{ key: 'app.title', value: '标题', score: 0.91 }]
 * 
 * // 通配符搜索
 * const wildcardResults = finder.wildcardSearch('app.*.title', messages);
 * // 返回所有匹配 app.*.title 模式的键
 * ```
 */
export class KeyFinder {
  /**
   * 模糊搜索
   * 
   * 使用 Levenshtein 距离算法查找相似的键
   * 
   * @param query - 搜索查询
   * @param messages - 消息对象
   * @param locale - 语言
   * @param options - 搜索选项
   * @returns 搜索结果数组
   */
  fuzzySearch(
    query: string,
    messages: Messages,
    locale: Locale,
    options: SearchOptions = {},
  ): SearchResult[] {
    const {
      caseSensitive = false,
      maxResults = 10,
      minScore = 0.6,
      searchValues = false,
    } = options

    const normalizedQuery = caseSensitive ? query : query.toLowerCase()
    const results: SearchResult[] = []

    // 收集所有键值对
    const allKeys = this.flattenMessages(messages)

    for (const [key, value] of allKeys) {
      const normalizedKey = caseSensitive ? key : key.toLowerCase()
      const normalizedValue = caseSensitive ? value : value.toLowerCase()

      // 计算键的相似度
      const keyScore = this.calculateSimilarity(normalizedQuery, normalizedKey)

      // 如果启用值搜索，也计算值的相似度
      let valueScore = 0
      if (searchValues && typeof value === 'string') {
        valueScore = this.calculateSimilarity(normalizedQuery, normalizedValue)
      }

      // 取较高的分数
      const score = Math.max(keyScore, valueScore)

      if (score >= minScore) {
        results.push({
          key,
          value: String(value),
          locale,
          score,
        })
      }
    }

    // 按分数降序排序
    results.sort((a, b) => (b.score || 0) - (a.score || 0))

    // 限制结果数量
    return results.slice(0, maxResults)
  }

  /**
   * 通配符搜索
   * 
   * 支持 * (任意字符) 和 ? (单个字符) 通配符
   * 
   * @param pattern - 通配符模式
   * @param messages - 消息对象
   * @param locale - 语言
   * @param options - 搜索选项
   * @returns 搜索结果数组
   */
  wildcardSearch(
    pattern: string,
    messages: Messages,
    locale: Locale,
    options: SearchOptions = {},
  ): SearchResult[] {
    const { caseSensitive = false, maxResults = 100 } = options

    // 将通配符模式转换为正则表达式
    const regex = this.wildcardToRegex(pattern, caseSensitive)
    const results: SearchResult[] = []

    // 收集所有键值对
    const allKeys = this.flattenMessages(messages)

    for (const [key, value] of allKeys) {
      if (regex.test(key)) {
        results.push({
          key,
          value: String(value),
          locale,
        })

        if (results.length >= maxResults) {
          break
        }
      }
    }

    return results
  }

  /**
   * 精确搜索
   * 
   * @param query - 搜索查询
   * @param messages - 消息对象
   * @param locale - 语言
   * @returns 搜索结果（如果找到）
   */
  exactSearch(
    query: string,
    messages: Messages,
    locale: Locale,
  ): SearchResult | null {
    const value = this.getNestedValue(messages, query)

    if (value !== undefined) {
      return {
        key: query,
        value: String(value),
        locale,
        score: 1.0,
      }
    }

    return null
  }

  /**
   * 前缀搜索
   * 
   * @param prefix - 前缀
   * @param messages - 消息对象
   * @param locale - 语言
   * @param options - 搜索选项
   * @returns 搜索结果数组
   */
  prefixSearch(
    prefix: string,
    messages: Messages,
    locale: Locale,
    options: SearchOptions = {},
  ): SearchResult[] {
    const { caseSensitive = false, maxResults = 100 } = options
    const normalizedPrefix = caseSensitive ? prefix : prefix.toLowerCase()
    const results: SearchResult[] = []

    const allKeys = this.flattenMessages(messages)

    for (const [key, value] of allKeys) {
      const normalizedKey = caseSensitive ? key : key.toLowerCase()

      if (normalizedKey.startsWith(normalizedPrefix)) {
        results.push({
          key,
          value: String(value),
          locale,
        })

        if (results.length >= maxResults) {
          break
        }
      }
    }

    return results
  }

  /**
   * 计算两个字符串的相似度
   * 
   * 使用 Levenshtein 距离算法
   * 
   * @param str1 - 字符串1
   * @param str2 - 字符串2
   * @returns 相似度分数（0-1）
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1, str2)
    const maxLength = Math.max(str1.length, str2.length)

    if (maxLength === 0) {
      return 1.0
    }

    return 1 - distance / maxLength
  }

  /**
   * Levenshtein 距离算法
   * 
   * 计算两个字符串之间的编辑距离
   * 
   * @param str1 - 字符串1
   * @param str2 - 字符串2
   * @returns 编辑距离
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length
    const len2 = str2.length

    // 创建二维数组
    const matrix: number[][] = Array(len1 + 1)
      .fill(null)
      .map(() => Array(len2 + 1).fill(0))

    // 初始化第一行和第一列
    for (let i = 0; i <= len1; i++) {
      matrix[i][0] = i
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j
    }

    // 填充矩阵
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1

        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // 删除
          matrix[i][j - 1] + 1, // 插入
          matrix[i - 1][j - 1] + cost, // 替换
        )
      }
    }

    return matrix[len1][len2]
  }

  /**
   * 将通配符模式转换为正则表达式
   * 
   * @param pattern - 通配符模式
   * @param caseSensitive - 是否区分大小写
   * @returns 正则表达式
   */
  private wildcardToRegex(pattern: string, caseSensitive: boolean): RegExp {
    // 转义特殊字符，但保留 * 和 ?
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')

    const flags = caseSensitive ? '' : 'i'
    return new RegExp(`^${escaped}$`, flags)
  }

  /**
   * 展平嵌套的消息对象
   * 
   * @param obj - 消息对象
   * @param prefix - 前缀
   * @returns 键值对数组
   */
  private flattenMessages(obj: any, prefix: string = ''): Array<[string, any]> {
    const result: Array<[string, any]> = []

    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        continue
      }

      const fullKey = prefix ? `${prefix}.${key}` : key
      const value = obj[key]

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // 递归处理嵌套对象
        result.push(...this.flattenMessages(value, fullKey))
      } else {
        result.push([fullKey, value])
      }
    }

    return result
  }

  /**
   * 获取嵌套值
   * 
   * @param obj - 对象
   * @param path - 路径
   * @returns 值
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