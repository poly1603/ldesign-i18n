/**
 * @ldesign/i18n - Translation Diagnostics
 * 翻译诊断工具：健康检查、一致性验证、报告生成
 *
 * @version 1.0.0
 * @author LDesign Team
 */

import type { I18nInstance, Locale, Messages } from '../types'

// ==================== 类型定义 ====================

/**
 * 诊断问题严重级别
 */
export type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'hint'

/**
 * 诊断问题类型
 */
export type DiagnosticType =
  | 'missing_key'        // 缺失的翻译键
  | 'unused_key'         // 未使用的翻译键
  | 'duplicate_key'      // 重复的翻译键
  | 'empty_value'        // 空翻译值
  | 'parameter_mismatch' // 参数不匹配
  | 'inconsistent_type'  // 类型不一致
  | 'naming_convention'  // 命名规范问题
  | 'too_long'           // 翻译过长
  | 'placeholder_error'  // 占位符错误

/**
 * 单个诊断问题
 */
export interface DiagnosticIssue {
  /** 问题类型 */
  type: DiagnosticType
  /** 严重级别 */
  severity: DiagnosticSeverity
  /** 相关语言 */
  locale: Locale
  /** 相关键名 */
  key: string
  /** 问题描述 */
  message: string
  /** 建议修复方案 */
  suggestion?: string
  /** 相关详情 */
  details?: Record<string, unknown>
}

/**
 * 翻译健康状态
 */
export interface TranslationHealth {
  /** 总体健康评分 (0-100) */
  score: number
  /** 健康状态 */
  status: 'healthy' | 'warning' | 'critical'
  /** 总键数 */
  totalKeys: number
  /** 已翻译键数 */
  translatedKeys: number
  /** 覆盖率 */
  coverage: number
  /** 问题统计 */
  issues: {
    errors: number
    warnings: number
    info: number
    hints: number
  }
}

/**
 * 诊断报告
 */
export interface DiagnosticReport {
  /** 生成时间 */
  timestamp: Date
  /** 诊断的语言列表 */
  locales: Locale[]
  /** 基准语言 */
  baseLocale: Locale
  /** 健康状态 */
  health: TranslationHealth
  /** 所有问题 */
  issues: DiagnosticIssue[]
  /** 每语言统计 */
  localeStats: Map<Locale, LocaleStats>
  /** 建议列表 */
  recommendations: string[]
}

/**
 * 单语言统计
 */
export interface LocaleStats {
  locale: Locale
  totalKeys: number
  translatedKeys: number
  missingKeys: number
  emptyValues: number
  coverage: number
}

/**
 * 诊断配置
 */
export interface DiagnosticsConfig {
  /** 基准语言（用于对比） */
  baseLocale?: Locale
  /** 是否检查未使用的键 */
  checkUnusedKeys?: boolean
  /** 是否检查命名规范 */
  checkNamingConvention?: boolean
  /** 命名规范正则 */
  namingPattern?: RegExp
  /** 翻译最大长度 */
  maxTranslationLength?: number
  /** 是否检查参数一致性 */
  checkParameterConsistency?: boolean
  /** 要忽略的键模式 */
  ignorePatterns?: (string | RegExp)[]
  /** 已知使用的键（用于检查未使用键） */
  usedKeys?: Set<string>
}

// ==================== 工具函数 ====================

/**
 * 提取消息中的占位符参数
 */
function extractPlaceholders(message: string): string[] {
  const placeholders: string[] = []
  // 匹配 {name} 或 {name, type} 格式
  const regex = /\{([^}:,]+)(?:,[^}]*)?\}/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(message)) !== null) {
    placeholders.push(match[1].trim())
  }
  return placeholders
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
 * 检查键是否匹配忽略模式
 */
function shouldIgnoreKey(key: string, patterns: (string | RegExp)[]): boolean {
  return patterns.some(pattern => {
    if (typeof pattern === 'string') {
      return key === pattern || key.startsWith(pattern + '.')
    }
    return pattern.test(key)
  })
}

// ==================== 主类 ====================

/**
 * 翻译诊断器
 *
 * 提供翻译健康检查、一致性验证和诊断报告生成功能。
 *
 * @example
 * ```typescript
 * const diagnostics = new TranslationDiagnostics(i18n, {
 *   baseLocale: 'en',
 *   checkParameterConsistency: true
 * })
 *
 * // 运行完整诊断
 * const report = diagnostics.runDiagnostics()
 * console.log('健康评分:', report.health.score)
 *
 * // 检查特定问题
 * const missingKeys = diagnostics.findMissingKeys('zh-CN')
 * const paramErrors = diagnostics.checkParameterConsistency()
 * ```
 */
export class TranslationDiagnostics {
  private readonly i18n: I18nInstance
  private readonly config: Required<DiagnosticsConfig>

  /**
   * 创建诊断器实例
   *
   * @param i18n - I18n 实例
   * @param config - 诊断配置
   */
  constructor(i18n: I18nInstance, config: DiagnosticsConfig = {}) {
    this.i18n = i18n
    this.config = {
      baseLocale: config.baseLocale || i18n.fallbackLocale as string || 'en',
      checkUnusedKeys: config.checkUnusedKeys ?? false,
      checkNamingConvention: config.checkNamingConvention ?? true,
      namingPattern: config.namingPattern || /^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)*$/,
      maxTranslationLength: config.maxTranslationLength || 500,
      checkParameterConsistency: config.checkParameterConsistency ?? true,
      ignorePatterns: config.ignorePatterns || [],
      usedKeys: config.usedKeys || new Set(),
    }
  }

  // ==================== 主要方法 ====================

  /**
   * 运行完整诊断
   *
   * @returns 诊断报告
   */
  runDiagnostics(): DiagnosticReport {
    const locales = this.i18n.getAvailableLocales()
    const issues: DiagnosticIssue[] = []
    const localeStats = new Map<Locale, LocaleStats>()

    // 收集所有问题
    for (const locale of locales) {
      // 缺失键检查
      issues.push(...this.findMissingKeys(locale))

      // 空值检查
      issues.push(...this.findEmptyValues(locale))

      // 命名规范检查
      if (this.config.checkNamingConvention) {
        issues.push(...this.checkNamingConvention(locale))
      }

      // 过长翻译检查
      issues.push(...this.checkTranslationLength(locale))

      // 计算语言统计
      localeStats.set(locale, this.calculateLocaleStats(locale))
    }

    // 参数一致性检查
    if (this.config.checkParameterConsistency) {
      issues.push(...this.checkParameterConsistency())
    }

    // 未使用键检查
    if (this.config.checkUnusedKeys && this.config.usedKeys.size > 0) {
      issues.push(...this.findUnusedKeys())
    }

    // 计算健康状态
    const health = this.calculateHealth(issues, localeStats)

    // 生成建议
    const recommendations = this.generateRecommendations(issues, health)

    return {
      timestamp: new Date(),
      locales,
      baseLocale: this.config.baseLocale,
      health,
      issues,
      localeStats,
      recommendations,
    }
  }

  /**
   * 获取翻译健康状态
   */
  getHealth(): TranslationHealth {
    const report = this.runDiagnostics()
    return report.health
  }

  // ==================== 检查方法 ====================

  /**
   * 查找缺失的翻译键
   *
   * @param locale - 目标语言
   * @returns 缺失键问题列表
   */
  findMissingKeys(locale: Locale): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = []
    const baseMessages = this.i18n.getMessages(this.config.baseLocale)
    const targetMessages = this.i18n.getMessages(locale)

    if (!baseMessages || !targetMessages || locale === this.config.baseLocale) {
      return issues
    }

    const baseKeys = getAllKeys(baseMessages)

    for (const key of baseKeys) {
      if (shouldIgnoreKey(key, this.config.ignorePatterns)) {
        continue
      }

      const targetValue = getNestedValue(targetMessages, key)

      if (targetValue === undefined) {
        issues.push({
          type: 'missing_key',
          severity: 'error',
          locale,
          key,
          message: `翻译键 "${key}" 在 ${locale} 中缺失`,
          suggestion: `添加 "${key}" 的 ${locale} 翻译`,
        })
      }
    }

    return issues
  }

  /**
   * 查找空的翻译值
   *
   * @param locale - 目标语言
   * @returns 空值问题列表
   */
  findEmptyValues(locale: Locale): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = []
    const messages = this.i18n.getMessages(locale)

    if (!messages) {
      return issues
    }

    const keys = getAllKeys(messages)

    for (const key of keys) {
      if (shouldIgnoreKey(key, this.config.ignorePatterns)) {
        continue
      }

      const value = getNestedValue(messages, key)

      if (value !== undefined && value.trim() === '') {
        issues.push({
          type: 'empty_value',
          severity: 'warning',
          locale,
          key,
          message: `翻译键 "${key}" 的值为空`,
          suggestion: `为 "${key}" 添加有效的翻译内容`,
        })
      }
    }

    return issues
  }

  /**
   * 查找未使用的翻译键
   *
   * @returns 未使用键问题列表
   */
  findUnusedKeys(): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = []
    const messages = this.i18n.getMessages(this.config.baseLocale)

    if (!messages || this.config.usedKeys.size === 0) {
      return issues
    }

    const allKeys = getAllKeys(messages)

    for (const key of allKeys) {
      if (shouldIgnoreKey(key, this.config.ignorePatterns)) {
        continue
      }

      if (!this.config.usedKeys.has(key)) {
        issues.push({
          type: 'unused_key',
          severity: 'info',
          locale: this.config.baseLocale,
          key,
          message: `翻译键 "${key}" 未被使用`,
          suggestion: `如果确定不需要，可以移除此翻译键`,
        })
      }
    }

    return issues
  }

  /**
   * 检查参数一致性
   *
   * @returns 参数不匹配问题列表
   */
  checkParameterConsistency(): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = []
    const locales = this.i18n.getAvailableLocales()
    const baseMessages = this.i18n.getMessages(this.config.baseLocale)

    if (!baseMessages) {
      return issues
    }

    const baseKeys = getAllKeys(baseMessages)

    for (const key of baseKeys) {
      if (shouldIgnoreKey(key, this.config.ignorePatterns)) {
        continue
      }

      const baseValue = getNestedValue(baseMessages, key)
      if (!baseValue) continue

      const baseParams = extractPlaceholders(baseValue)

      for (const locale of locales) {
        if (locale === this.config.baseLocale) continue

        const targetMessages = this.i18n.getMessages(locale)
        if (!targetMessages) continue

        const targetValue = getNestedValue(targetMessages, key)
        if (!targetValue) continue

        const targetParams = extractPlaceholders(targetValue)

        // 检查参数是否匹配
        const missingParams = baseParams.filter(p => !targetParams.includes(p))
        const extraParams = targetParams.filter(p => !baseParams.includes(p))

        if (missingParams.length > 0) {
          issues.push({
            type: 'parameter_mismatch',
            severity: 'error',
            locale,
            key,
            message: `翻译键 "${key}" 缺少参数: ${missingParams.join(', ')}`,
            suggestion: `添加缺失的参数占位符: ${missingParams.map(p => `{${p}}`).join(', ')}`,
            details: { missingParams, baseParams, targetParams },
          })
        }

        if (extraParams.length > 0) {
          issues.push({
            type: 'parameter_mismatch',
            severity: 'warning',
            locale,
            key,
            message: `翻译键 "${key}" 包含多余参数: ${extraParams.join(', ')}`,
            suggestion: `检查是否需要这些额外参数，或从基准语言添加`,
            details: { extraParams, baseParams, targetParams },
          })
        }
      }
    }

    return issues
  }

  /**
   * 检查命名规范
   *
   * @param locale - 目标语言
   * @returns 命名规范问题列表
   */
  checkNamingConvention(locale: Locale): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = []
    const messages = this.i18n.getMessages(locale)

    if (!messages) {
      return issues
    }

    const keys = getAllKeys(messages)

    for (const key of keys) {
      if (shouldIgnoreKey(key, this.config.ignorePatterns)) {
        continue
      }

      if (!this.config.namingPattern.test(key)) {
        issues.push({
          type: 'naming_convention',
          severity: 'hint',
          locale,
          key,
          message: `翻译键 "${key}" 不符合命名规范`,
          suggestion: `建议使用 camelCase 格式，如 "user.profileName"`,
        })
      }
    }

    return issues
  }

  /**
   * 检查翻译长度
   *
   * @param locale - 目标语言
   * @returns 过长翻译问题列表
   */
  checkTranslationLength(locale: Locale): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = []
    const messages = this.i18n.getMessages(locale)

    if (!messages) {
      return issues
    }

    const keys = getAllKeys(messages)

    for (const key of keys) {
      if (shouldIgnoreKey(key, this.config.ignorePatterns)) {
        continue
      }

      const value = getNestedValue(messages, key)

      if (value && value.length > this.config.maxTranslationLength) {
        issues.push({
          type: 'too_long',
          severity: 'info',
          locale,
          key,
          message: `翻译键 "${key}" 的值过长 (${value.length} 字符)`,
          suggestion: `考虑拆分为多个键或简化文本`,
          details: { length: value.length, maxLength: this.config.maxTranslationLength },
        })
      }
    }

    return issues
  }

  // ==================== 统计方法 ====================

  /**
   * 计算单语言统计
   */
  private calculateLocaleStats(locale: Locale): LocaleStats {
    const baseMessages = this.i18n.getMessages(this.config.baseLocale)
    const targetMessages = this.i18n.getMessages(locale)

    if (!baseMessages) {
      return {
        locale,
        totalKeys: 0,
        translatedKeys: 0,
        missingKeys: 0,
        emptyValues: 0,
        coverage: 0,
      }
    }

    const baseKeys = getAllKeys(baseMessages)
    const totalKeys = baseKeys.length

    if (!targetMessages || locale === this.config.baseLocale) {
      return {
        locale,
        totalKeys,
        translatedKeys: totalKeys,
        missingKeys: 0,
        emptyValues: 0,
        coverage: 100,
      }
    }

    let translatedKeys = 0
    let emptyValues = 0

    for (const key of baseKeys) {
      const value = getNestedValue(targetMessages, key)
      if (value !== undefined) {
        translatedKeys++
        if (value.trim() === '') {
          emptyValues++
        }
      }
    }

    return {
      locale,
      totalKeys,
      translatedKeys,
      missingKeys: totalKeys - translatedKeys,
      emptyValues,
      coverage: totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 100,
    }
  }

  /**
   * 计算整体健康状态
   */
  private calculateHealth(
    issues: DiagnosticIssue[],
    localeStats: Map<Locale, LocaleStats>
  ): TranslationHealth {
    const issueCount = {
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      info: issues.filter(i => i.severity === 'info').length,
      hints: issues.filter(i => i.severity === 'hint').length,
    }

    // 计算总键数和已翻译键数
    let totalKeys = 0
    let translatedKeys = 0
    for (const stats of localeStats.values()) {
      totalKeys += stats.totalKeys
      translatedKeys += stats.translatedKeys
    }

    const coverage = totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 100

    // 计算健康评分
    // 基础分 100，每个错误扣 5 分，每个警告扣 2 分，每个 info 扣 0.5 分
    let score = 100
    score -= issueCount.errors * 5
    score -= issueCount.warnings * 2
    score -= issueCount.info * 0.5
    score = Math.max(0, Math.min(100, Math.round(score)))

    // 确定健康状态
    let status: 'healthy' | 'warning' | 'critical'
    if (score >= 80 && issueCount.errors === 0) {
      status = 'healthy'
    } else if (score >= 50 || issueCount.errors < 5) {
      status = 'warning'
    } else {
      status = 'critical'
    }

    return {
      score,
      status,
      totalKeys,
      translatedKeys,
      coverage,
      issues: issueCount,
    }
  }

  /**
   * 生成建议列表
   */
  private generateRecommendations(
    issues: DiagnosticIssue[],
    health: TranslationHealth
  ): string[] {
    const recommendations: string[] = []

    if (health.issues.errors > 0) {
      recommendations.push(`优先修复 ${health.issues.errors} 个错误级别问题`)
    }

    if (health.coverage < 100) {
      recommendations.push(`完成翻译以提高覆盖率（当前 ${health.coverage}%）`)
    }

    const missingCount = issues.filter(i => i.type === 'missing_key').length
    if (missingCount > 10) {
      recommendations.push(`有 ${missingCount} 个缺失翻译，建议批量处理`)
    }

    const paramErrors = issues.filter(i => i.type === 'parameter_mismatch').length
    if (paramErrors > 0) {
      recommendations.push(`检查并修复 ${paramErrors} 个参数不匹配问题`)
    }

    const emptyValues = issues.filter(i => i.type === 'empty_value').length
    if (emptyValues > 0) {
      recommendations.push(`填充 ${emptyValues} 个空翻译值`)
    }

    if (recommendations.length === 0) {
      recommendations.push('翻译状态良好，继续保持！')
    }

    return recommendations
  }

  // ==================== 导出方法 ====================

  /**
   * 导出报告为 JSON
   */
  exportReportAsJSON(): string {
    const report = this.runDiagnostics()
    return JSON.stringify({
      ...report,
      localeStats: Object.fromEntries(report.localeStats),
    }, null, 2)
  }

  /**
   * 导出问题为 CSV
   */
  exportIssuesAsCSV(): string {
    const report = this.runDiagnostics()
    const headers = ['类型', '严重级别', '语言', '键名', '描述', '建议']
    const rows = report.issues.map(issue => [
      issue.type,
      issue.severity,
      issue.locale,
      issue.key,
      issue.message,
      issue.suggestion || '',
    ])

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
  }
}

/**
 * 创建诊断器实例
 *
 * @param i18n - I18n 实例
 * @param config - 诊断配置
 * @returns 诊断器实例
 */
export function createDiagnostics(
  i18n: I18nInstance,
  config?: DiagnosticsConfig
): TranslationDiagnostics {
  return new TranslationDiagnostics(i18n, config)
}
