/**
 * 翻译键管理工具
 * 
 * 提供翻译键的收集、分析和管理功能
 */

import type { Locale, Messages } from '../types'

/**
 * 键使用信息
 */
export interface KeyUsageInfo {
  key: string
  usageCount: number
  locales: Locale[]
  lastUsed: number
  translationExists: Record<Locale, boolean>
}

/**
 * 翻译覆盖率报告
 */
export interface CoverageReport {
  locale: Locale
  totalKeys: number
  translatedKeys: number
  missingKeys: string[]
  emptyKeys: string[]
  coverage: number
}

/**
 * 键分析结果
 */
export interface KeyAnalysisResult {
  totalKeys: number
  unusedKeys: string[]
  duplicateKeys: string[]
  inconsistentKeys: Array<{
    key: string
    reason: string
    locales: Locale[]
  }>
}

/**
 * 翻译键管理器
 * 
 * 提供翻译键的追踪、分析和管理功能
 */
export class TranslationKeyManager {
  private usageMap = new Map<string, KeyUsageInfo>()
  private messagesCache = new Map<Locale, Messages>()

  /**
   * 记录键的使用
   */
  trackUsage(key: string, locale: Locale): void {
    const info = this.usageMap.get(key) || {
      key,
      usageCount: 0,
      locales: [],
      lastUsed: 0,
      translationExists: {},
    }

    info.usageCount++
    info.lastUsed = Date.now()
    
    if (!info.locales.includes(locale)) {
      info.locales.push(locale)
    }

    this.usageMap.set(key, info)
  }

  /**
   * 设置翻译消息（用于分析）
   */
  setMessages(locale: Locale, messages: Messages): void {
    this.messagesCache.set(locale, messages)
    
    // 更新所有键的翻译存在状态
    const allKeys = this.getAllKeys(messages)
    allKeys.forEach(key => {
      const info = this.usageMap.get(key)
      if (info) {
        info.translationExists[locale] = true
      }
    })
  }

  /**
   * 获取所有键（递归）
   */
  private getAllKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = []
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      
      if (typeof value === 'string') {
        keys.push(fullKey)
      } else if (typeof value === 'object' && value !== null) {
        keys.push(...this.getAllKeys(value, fullKey))
      }
    }
    
    return keys
  }

  /**
   * 获取未使用的键
   */
  getUnusedKeys(threshold = 0): string[] {
    const unused: string[] = []
    
    for (const [key, info] of this.usageMap) {
      if (info.usageCount <= threshold) {
        unused.push(key)
      }
    }
    
    return unused
  }

  /**
   * 获取使用频率最高的键
   */
  getMostUsedKeys(limit = 10): KeyUsageInfo[] {
    return Array.from(this.usageMap.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
  }

  /**
   * 生成翻译覆盖率报告
   */
  generateCoverageReport(locale: Locale, baseLocale?: Locale): CoverageReport {
    const messages = this.messagesCache.get(locale)
    const baseMessages = baseLocale ? this.messagesCache.get(baseLocale) : null
    
    if (!messages) {
      return {
        locale,
        totalKeys: 0,
        translatedKeys: 0,
        missingKeys: [],
        emptyKeys: [],
        coverage: 0,
      }
    }

    const allKeys = baseMessages 
      ? this.getAllKeys(baseMessages)
      : this.getAllKeys(messages)
    
    const translatedKeys: string[] = []
    const missingKeys: string[] = []
    const emptyKeys: string[] = []

    allKeys.forEach(key => {
      const value = this.getNestedValue(messages, key)
      
      if (value === undefined) {
        missingKeys.push(key)
      } else if (typeof value === 'string' && value.trim() === '') {
        emptyKeys.push(key)
      } else {
        translatedKeys.push(key)
      }
    })

    const coverage = allKeys.length > 0 
      ? (translatedKeys.length / allKeys.length) * 100 
      : 0

    return {
      locale,
      totalKeys: allKeys.length,
      translatedKeys: translatedKeys.length,
      missingKeys,
      emptyKeys,
      coverage: Math.round(coverage * 100) / 100,
    }
  }

  /**
   * 分析所有键
   */
  analyzeKeys(): KeyAnalysisResult {
    const allKeys = new Set<string>()
    const keysByLocale = new Map<string, Set<Locale>>()
    const duplicates: string[] = []
    const inconsistent: Array<{
      key: string
      reason: string
      locales: Locale[]
    }> = []

    // 收集所有键
    for (const [locale, messages] of this.messagesCache) {
      const keys = this.getAllKeys(messages)
      keys.forEach(key => {
        allKeys.add(key)
        
        if (!keysByLocale.has(key)) {
          keysByLocale.set(key, new Set())
        }
        keysByLocale.get(key)!.add(locale)
      })
    }

    // 检测不一致的键
    for (const [key, locales] of keysByLocale) {
      if (locales.size < this.messagesCache.size) {
        inconsistent.push({
          key,
          reason: 'Missing in some locales',
          locales: Array.from(locales),
        })
      }
    }

    return {
      totalKeys: allKeys.size,
      unusedKeys: this.getUnusedKeys(),
      duplicateKeys: duplicates,
      inconsistentKeys: inconsistent,
    }
  }

  /**
   * 清理未使用的键
   */
  cleanupUnusedKeys(threshold = 0): string[] {
    const unused = this.getUnusedKeys(threshold)
    unused.forEach(key => this.usageMap.delete(key))
    return unused
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

  /**
   * 导出使用统计
   */
  exportUsageStats(): Record<string, KeyUsageInfo> {
    return Object.fromEntries(this.usageMap)
  }

  /**
   * 重置所有统计
   */
  reset(): void {
    this.usageMap.clear()
    this.messagesCache.clear()
  }

  /**
   * 获取统计摘要
   */
  getSummary(): {
    totalTracked: number
    totalLocales: number
    averageUsage: number
    lastActivity: number
  } {
    const total = this.usageMap.size
    const totalUsage = Array.from(this.usageMap.values())
      .reduce((sum, info) => sum + info.usageCount, 0)
    const lastActivity = Math.max(
      ...Array.from(this.usageMap.values()).map(info => info.lastUsed),
      0
    )

    return {
      totalTracked: total,
      totalLocales: this.messagesCache.size,
      averageUsage: total > 0 ? totalUsage / total : 0,
      lastActivity,
    }
  }
}

/**
 * 创建翻译键管理器实例
 */
export function createKeyManager(): TranslationKeyManager {
  return new TranslationKeyManager()
}