/**
 * @ldesign/i18n - 翻译键验证器
 *
 * 提供翻译键验证、模糊匹配和智能建议功能
 */

/**
 * 验证结果接口
 */
export interface ValidationResult {
  /** 键是否有效 */
  isValid: boolean
  /** 相似的键名建议 */
  suggestions: string[]
  /** 最接近的匹配 */
  didYouMean?: string
  /** 匹配分数(0-1) */
  score?: number
}

/**
 * 计算两个字符串的 Levenshtein 距离
 *
 * 用于模糊匹配和相似度计算
 *
 * @param str1 - 字符串1
 * @param str2 - 字符串2
 * @returns 编辑距离
 *
 * @private
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length

  // 优化: 如果其中一个为空,返回另一个的长度
  if (len1 === 0)
    return len2
  if (len2 === 0)
    return len1

  // 创建距离矩阵
  const matrix: number[][] = Array.from({ length: len1 + 1 }, () => Array.from({ length: len2 + 1 }, () => 0))

  // 初始化第一行和第一列
  for (let i = 0; i <= len1; i++) matrix[i][0] = i
  for (let j = 0; j <= len2; j++) matrix[0][j] = j

  // 计算编辑距离
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
 * 计算相似度分数(0-1)
 *
 * @param str1 - 字符串1
 * @param str2 - 字符串2
 * @returns 相似度分数,1 表示完全相同,0 表示完全不同
 */
function similarityScore(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length)
  if (maxLen === 0)
    return 1

  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  return 1 - distance / maxLen
}

/**
 * 翻译键验证器
 *
 * 验证翻译键是否存在,并提供智能建议
 */
export class TranslationKeyValidator {
  /** 可用的翻译键列表 */
  private availableKeys: Set<string> = new Set()
  /** 键索引缓存(用于快速查找) */
  private keyIndex: Map<string, string[]> = new Map()
  /** 相似度阈值(0-1) */
  private readonly similarityThreshold: number
  /** 最大建议数量 */
  private readonly maxSuggestions: number

  /**
   * 创建验证器实例
   *
   * @param options - 配置选项
   * @param options.similarityThreshold - 相似度阈值,默认 0.6
   * @param options.maxSuggestions - 最大建议数量,默认 5
   */
  constructor(options: {
    similarityThreshold?: number
    maxSuggestions?: number
  } = {}) {
    this.similarityThreshold = options.similarityThreshold ?? 0.6
    this.maxSuggestions = options.maxSuggestions ?? 5
  }

  /**
   * 设置可用的翻译键
   *
   * @param keys - 翻译键数组或集合
   */
  setAvailableKeys(keys: string[] | Set<string>): void {
    this.availableKeys = keys instanceof Set ? keys : new Set(keys)
    this.buildKeyIndex()
  }

  /**
   * 添加翻译键
   *
   * @param keys - 要添加的键
   */
  addKeys(...keys: string[]): void {
    keys.forEach(key => this.availableKeys.add(key))
    this.buildKeyIndex()
  }

  /**
   * 构建键索引
   *
   * 按首字母分组,加速查找
   * @private
   */
  private buildKeyIndex(): void {
    this.keyIndex.clear()

    for (const key of this.availableKeys) {
      const firstChar = key[0]?.toLowerCase() || ''
      if (!this.keyIndex.has(firstChar)) {
        this.keyIndex.set(firstChar, [])
      }
      this.keyIndex.get(firstChar)!.push(key)
    }
  }

  /**
   * 验证翻译键
   *
   * 检查键是否存在,如果不存在则提供相似键建议
   *
   * @param key - 要验证的翻译键
   * @returns 验证结果
   *
   * @example
   * ```typescript
   * const validator = new TranslationKeyValidator();
   * validator.setAvailableKeys(['app.title', 'app.description', 'user.name']);
   *
   * const result = validator.validateKey('app.titel'); // 拼写错误
   * // 返回: {
   * //   isValid: false,
   * //   suggestions: ['app.title'],
   * //   didYouMean: 'app.title',
   * //   score: 0.9
   * // }
   * ```
   */
  validateKey(key: string): ValidationResult {
    // 检查键是否存在
    if (this.availableKeys.has(key)) {
      return {
        isValid: true,
        suggestions: [],
        score: 1,
      }
    }

    // 查找相似的键
    const similar = this.findSimilarKeys(key)

    return {
      isValid: false,
      suggestions: similar.map(s => s.key),
      didYouMean: similar[0]?.key,
      score: similar[0]?.score,
    }
  }

  /**
   * 查找相似的键
   *
   * 使用 Levenshtein 距离算法计算相似度
   *
   * @param key - 目标键
   * @returns 相似键列表,按相似度降序排序
   * @private
   */
  private findSimilarKeys(key: string): Array<{ key: string, score: number }> {
    const results: Array<{ key: string, score: number }> = []

    // 优化: 仅检查首字母相同或相近的键
    const firstChar = key[0]?.toLowerCase() || ''
    const candidateKeys = this.keyIndex.get(firstChar) || []

    // 如果首字母索引为空,扩大搜索范围
    const searchKeys = candidateKeys.length > 0
      ? candidateKeys
      : Array.from(this.availableKeys)

    // 计算所有候选键的相似度
    for (const candidateKey of searchKeys) {
      const score = similarityScore(key, candidateKey)

      // 仅保留超过阈值的结果
      if (score >= this.similarityThreshold) {
        results.push({ key: candidateKey, score })
      }
    }

    // 按相似度降序排序,返回前 N 个
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, this.maxSuggestions)
  }

  /**
   * 批量验证键
   *
   * @param keys - 要验证的键数组
   * @returns 验证结果数组
   */
  validateKeys(keys: string[]): ValidationResult[] {
    return keys.map(key => this.validateKey(key))
  }

  /**
   * 获取所有无效的键
   *
   * @param keys - 要验证的键数组
   * @returns 无效的键数组
   */
  getInvalidKeys(keys: string[]): string[] {
    return keys.filter(key => !this.availableKeys.has(key))
  }

  /**
   * 获取验证统计
   *
   * @param keys - 要验证的键数组
   * @returns 统计信息
   */
  getValidationStats(keys: string[]): {
    total: number
    valid: number
    invalid: number
    validRate: number
  } {
    const invalid = this.getInvalidKeys(keys)

    return {
      total: keys.length,
      valid: keys.length - invalid.length,
      invalid: invalid.length,
      validRate: keys.length > 0 ? (keys.length - invalid.length) / keys.length : 0,
    }
  }

  /**
   * 清空验证器
   */
  clear(): void {
    this.availableKeys.clear()
    this.keyIndex.clear()
  }
}

/**
 * 全局翻译键验证器实例
 */
export const globalKeyValidator = new TranslationKeyValidator()

/**
 * 快速验证翻译键
 *
 * 使用全局验证器进行验证
 *
 * @param key - 翻译键
 * @param availableKeys - 可用键列表(可选,不提供则使用已设置的键)
 * @returns 验证结果
 */
export function validateTranslationKey(
  key: string,
  availableKeys?: string[],
): ValidationResult {
  if (availableKeys) {
    globalKeyValidator.setAvailableKeys(availableKeys)
  }
  return globalKeyValidator.validateKey(key)
}
