/**
 * 翻译历史记录器
 * 
 * 记录和追踪翻译的使用历史，支持统计分析和热点检测
 */

import type { Locale, MessageKey, TranslateOptions } from '../types'

/**
 * 翻译记录条目
 */
export interface TranslationRecord {
  /** 翻译键 */
  key: MessageKey
  /** 语言 */
  locale: Locale
  /** 翻译结果 */
  value: string
  /** 时间戳 */
  timestamp: number
  /** 参数 */
  params?: Record<string, any>
  /** 命名空间 */
  namespace?: string
  /** 是否来自缓存 */
  fromCache?: boolean
}

/**
 * 翻译统计信息
 */
export interface TranslationStats {
  /** 总翻译次数 */
  totalTranslations: number
  /** 唯一键数量 */
  uniqueKeys: number
  /** 缓存命中次数 */
  cacheHits: number
  /** 缓存未命中次数 */
  cacheMisses: number
  /** 缓存命中率 */
  cacheHitRate: number
  /** 最常用的键（前N个） */
  topKeys: Array<{ key: string; count: number; percentage: number }>
  /** 语言分布 */
  localeDistribution: Record<Locale, number>
  /** 命名空间分布 */
  namespaceDistribution: Record<string, number>
  /** 平均查询时间（毫秒） */
  avgQueryTime?: number
}

/**
 * 历史记录选项
 */
export interface HistoryOptions {
  /** 最大记录数 */
  maxRecords?: number
  /** 是否启用统计 */
  enableStats?: boolean
  /** 是否启用时间统计 */
  enableTiming?: boolean
  /** 记录保留时间（毫秒） */
  retentionTime?: number
  /** 是否自动清理 */
  autoCleanup?: boolean
}

/**
 * 翻译历史记录器
 */
export class TranslationHistory {
  private records: TranslationRecord[] = []
  private keyUsageCount = new Map<string, number>()
  private localeUsageCount = new Map<Locale, number>()
  private namespaceUsageCount = new Map<string, number>()
  private cacheHits = 0
  private cacheMisses = 0
  private queryTimes: number[] = []
  private cleanupTimer?: NodeJS.Timeout

  private readonly options: Required<HistoryOptions>

  constructor(options: HistoryOptions = {}) {
    this.options = {
      maxRecords: options.maxRecords ?? 1000,
      enableStats: options.enableStats ?? true,
      enableTiming: options.enableTiming ?? false,
      retentionTime: options.retentionTime ?? 3600000, // 1小时
      autoCleanup: options.autoCleanup ?? true,
    }

    if (this.options.autoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * 记录翻译
   */
  record(
    key: MessageKey,
    locale: Locale,
    value: string,
    options?: {
      params?: Record<string, any>
      namespace?: string
      fromCache?: boolean
      queryTime?: number
    }
  ): void {
    const record: TranslationRecord = {
      key,
      locale,
      value,
      timestamp: Date.now(),
      params: options?.params,
      namespace: options?.namespace,
      fromCache: options?.fromCache,
    }

    // 添加记录
    this.records.push(record)

    // 限制记录数量
    if (this.records.length > this.options.maxRecords) {
      this.records.shift()
    }

    // 更新统计
    if (this.options.enableStats) {
      this.updateStats(key, locale, options?.namespace, options?.fromCache)
    }

    // 记录查询时间
    if (this.options.enableTiming && options?.queryTime !== undefined) {
      this.queryTimes.push(options.queryTime)
      if (this.queryTimes.length > 100) {
        this.queryTimes.shift()
      }
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(
    key: MessageKey,
    locale: Locale,
    namespace?: string,
    fromCache?: boolean
  ): void {
    // 更新键使用计数
    const keyCount = this.keyUsageCount.get(key) || 0
    this.keyUsageCount.set(key, keyCount + 1)

    // 更新语言使用计数
    const localeCount = this.localeUsageCount.get(locale) || 0
    this.localeUsageCount.set(locale, localeCount + 1)

    // 更新命名空间使用计数
    if (namespace) {
      const nsCount = this.namespaceUsageCount.get(namespace) || 0
      this.namespaceUsageCount.set(namespace, nsCount + 1)
    }

    // 更新缓存统计
    if (fromCache !== undefined) {
      if (fromCache) {
        this.cacheHits++
      } else {
        this.cacheMisses++
      }
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): TranslationStats {
    const totalTranslations = this.records.length
    const uniqueKeys = this.keyUsageCount.size
    const totalCacheQueries = this.cacheHits + this.cacheMisses
    const cacheHitRate = totalCacheQueries > 0 
      ? this.cacheHits / totalCacheQueries 
      : 0

    // 计算最常用的键
    const sortedKeys = Array.from(this.keyUsageCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, count]) => ({
        key,
        count,
        percentage: (count / totalTranslations) * 100,
      }))

    // 语言分布
    const localeDistribution: Record<Locale, number> = {}
    this.localeUsageCount.forEach((count, locale) => {
      localeDistribution[locale] = count
    })

    // 命名空间分布
    const namespaceDistribution: Record<string, number> = {}
    this.namespaceUsageCount.forEach((count, namespace) => {
      namespaceDistribution[namespace] = count
    })

    // 平均查询时间
    const avgQueryTime = this.queryTimes.length > 0
      ? this.queryTimes.reduce((a, b) => a + b, 0) / this.queryTimes.length
      : undefined

    return {
      totalTranslations,
      uniqueKeys,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      cacheHitRate: Math.round(cacheHitRate * 10000) / 100,
      topKeys: sortedKeys,
      localeDistribution,
      namespaceDistribution,
      avgQueryTime: avgQueryTime ? Math.round(avgQueryTime * 100) / 100 : undefined,
    }
  }

  /**
   * 获取热点键（最常用的键）
   */
  getHotKeys(limit = 20): Array<{ key: string; count: number }> {
    return Array.from(this.keyUsageCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, count]) => ({ key, count }))
  }

  /**
   * 获取最近的记录
   */
  getRecentRecords(limit = 50): TranslationRecord[] {
    return this.records.slice(-limit).reverse()
  }

  /**
   * 按键搜索记录
   */
  searchByKey(key: MessageKey): TranslationRecord[] {
    return this.records.filter(record => record.key === key)
  }

  /**
   * 按语言搜索记录
   */
  searchByLocale(locale: Locale): TranslationRecord[] {
    return this.records.filter(record => record.locale === locale)
  }

  /**
   * 按时间范围搜索记录
   */
  searchByTimeRange(startTime: number, endTime: number): TranslationRecord[] {
    return this.records.filter(
      record => record.timestamp >= startTime && record.timestamp <= endTime
    )
  }

  /**
   * 清理过期记录
   */
  cleanup(): void {
    const now = Date.now()
    const cutoffTime = now - this.options.retentionTime

    const beforeCount = this.records.length
    this.records = this.records.filter(record => record.timestamp > cutoffTime)
    const removedCount = beforeCount - this.records.length

    if (removedCount > 0) {
      // 重新计算统计
      this.rebuildStats()
    }
  }

  /**
   * 重建统计信息
   */
  private rebuildStats(): void {
    this.keyUsageCount.clear()
    this.localeUsageCount.clear()
    this.namespaceUsageCount.clear()

    this.records.forEach(record => {
      // 键计数
      const keyCount = this.keyUsageCount.get(record.key) || 0
      this.keyUsageCount.set(record.key, keyCount + 1)

      // 语言计数
      const localeCount = this.localeUsageCount.get(record.locale) || 0
      this.localeUsageCount.set(record.locale, localeCount + 1)

      // 命名空间计数
      if (record.namespace) {
        const nsCount = this.namespaceUsageCount.get(record.namespace) || 0
        this.namespaceUsageCount.set(record.namespace, nsCount + 1)
      }
    })
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    // 每小时清理一次
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, 3600000)

    if (typeof (this.cleanupTimer as any)?.unref === 'function') {
      (this.cleanupTimer as any).unref()
    }
  }

  /**
   * 清空所有记录
   */
  clear(): void {
    this.records = []
    this.keyUsageCount.clear()
    this.localeUsageCount.clear()
    this.namespaceUsageCount.clear()
    this.cacheHits = 0
    this.cacheMisses = 0
    this.queryTimes = []
  }

  /**
   * 导出记录为JSON
   */
  export(): string {
    return JSON.stringify({
      records: this.records,
      stats: this.getStats(),
      exportTime: Date.now(),
    }, null, 2)
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    this.clear()
  }
}

/**
 * 创建翻译历史记录器
 */
export function createTranslationHistory(options?: HistoryOptions): TranslationHistory {
  return new TranslationHistory(options)
}