/**
 * useI18nPerformance - 性能监控组合式函数
 * 
 * 监控翻译性能和缓存效率
 */

import { ref, computed, watch, onUnmounted } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { useI18n } from './useI18n'

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 总翻译次数 */
  totalTranslations: number
  /** 缓存命中次数 */
  cacheHits: number
  /** 缓存未命中次数 */
  cacheMisses: number
  /** 缓存命中率 (%) */
  cacheHitRate: number
  /** 平均翻译时间 (ms) */
  avgTranslationTime: number
  /** 最慢的翻译 */
  slowestTranslations: Array<{
    key: string
    time: number
    timestamp: number
  }>
  /** 最常用的键 */
  mostUsedKeys: Array<{
    key: string
    count: number
  }>
  /** 内存使用估算 (KB) */
  estimatedMemoryUsage: number
}

/**
 * 性能记录
 */
interface PerformanceRecord {
  key: string
  startTime: number
  endTime: number
  duration: number
  fromCache: boolean
}

export interface UseI18nPerformanceOptions {
  /** 是否启用性能监控 */
  enabled?: boolean
  /** 记录的最大翻译数 */
  maxRecords?: number
  /** 慢翻译阈值 (ms) */
  slowThreshold?: number
  /** 是否自动报告 */
  autoReport?: boolean
  /** 报告间隔 (ms) */
  reportInterval?: number
}

export interface UseI18nPerformanceReturn {
  /** 性能指标 */
  metrics: ComputedRef<PerformanceMetrics>
  /** 是否启用 */
  enabled: Ref<boolean>
  /** 开始监控 */
  start: () => void
  /** 停止监控 */
  stop: () => void
  /** 重置统计 */
  reset: () => void
  /** 获取报告 */
  getReport: () => string
  /** 导出数据 */
  exportData: () => string
}

export function useI18nPerformance(
  options: UseI18nPerformanceOptions = {}
): UseI18nPerformanceReturn {
  const { i18n, locale } = useI18n()

  const {
    enabled: initialEnabled = true,
    maxRecords = 100,
    slowThreshold = 10,
    autoReport = false,
    reportInterval = 60000,
  } = options

  const enabled = ref(initialEnabled)
  const records: PerformanceRecord[] = []
  const keyUsageCount = new Map<string, number>()
  const translationTimes: number[] = []
  let cacheHits = 0
  let cacheMisses = 0
  let reportTimer: NodeJS.Timeout | undefined

  /**
   * 包装翻译函数以监控性能
   */
  const originalT = i18n.t.bind(i18n)
  let isMonitoring = false

  const startMonitoring = () => {
    if (isMonitoring) return

    isMonitoring = true
    i18n.t = new Proxy(originalT, {
      apply(target, thisArg, args) {
        if (!enabled.value) {
          return Reflect.apply(target, thisArg, args)
        }

        const key = args[0] as string
        const startTime = performance.now()

        // 检查缓存
        const cacheKey = `${locale.value}:${key}`
        const fromCache = (i18n as any).cache?.has(cacheKey) || false

        if (fromCache) {
          cacheHits++
        } else {
          cacheMisses++
        }

        // 执行翻译
        const result = Reflect.apply(target, thisArg, args)

        const endTime = performance.now()
        const duration = endTime - startTime

        // 记录性能数据
        const record: PerformanceRecord = {
          key,
          startTime,
          endTime,
          duration,
          fromCache,
        }

        records.push(record)
        if (records.length > maxRecords) {
          records.shift()
        }

        translationTimes.push(duration)
        if (translationTimes.length > maxRecords) {
          translationTimes.shift()
        }

        // 更新键使用计数
        const count = keyUsageCount.get(key) || 0
        keyUsageCount.set(key, count + 1)

        return result
      },
    })
  }

  const stopMonitoring = () => {
    if (!isMonitoring) return
    isMonitoring = false
    i18n.t = originalT
  }

  /**
   * 计算性能指标
   */
  const metrics = computed<PerformanceMetrics>(() => {
    const totalTranslations = records.length
    const totalCacheQueries = cacheHits + cacheMisses
    const cacheHitRate = totalCacheQueries > 0
      ? (cacheHits / totalCacheQueries) * 100
      : 0

    const avgTranslationTime = translationTimes.length > 0
      ? translationTimes.reduce((a, b) => a + b, 0) / translationTimes.length
      : 0

    // 获取最慢的翻译
    const slowestTranslations = [...records]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map(r => ({
        key: r.key,
        time: Math.round(r.duration * 100) / 100,
        timestamp: r.startTime,
      }))

    // 获取最常用的键
    const mostUsedKeys = Array.from(keyUsageCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, count]) => ({ key, count }))

    // 估算内存使用（粗略估算）
    const estimatedMemoryUsage = Math.round(
      (records.length * 100 + // 每条记录约100字节
        keyUsageCount.size * 50 + // 每个键约50字节
        translationTimes.length * 8) / // 每个数字8字节
      1024
    )

    return {
      totalTranslations,
      cacheHits,
      cacheMisses,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      avgTranslationTime: Math.round(avgTranslationTime * 100) / 100,
      slowestTranslations,
      mostUsedKeys,
      estimatedMemoryUsage,
    }
  })

  /**
   * 开始监控
   */
  const start = () => {
    enabled.value = true
    startMonitoring()

    if (autoReport && !reportTimer) {
      reportTimer = setInterval(() => {
        console.log('[I18n Performance Report]')
        console.log(getReport())
      }, reportInterval)

      if (typeof (reportTimer as any)?.unref === 'function') {
        (reportTimer as any).unref()
      }
    }
  }

  /**
   * 停止监控
   */
  const stop = () => {
    enabled.value = false
    stopMonitoring()

    if (reportTimer) {
      clearInterval(reportTimer)
      reportTimer = undefined
    }
  }

  /**
   * 重置统计
   */
  const reset = () => {
    records.length = 0
    translationTimes.length = 0
    keyUsageCount.clear()
    cacheHits = 0
    cacheMisses = 0
  }

  /**
   * 获取报告
   */
  const getReport = (): string => {
    const m = metrics.value

    return `
Performance Report
==================
Total Translations: ${m.totalTranslations}
Cache Hit Rate: ${m.cacheHitRate}%
Average Translation Time: ${m.avgTranslationTime}ms
Memory Usage: ~${m.estimatedMemoryUsage}KB

Slowest Translations:
${m.slowestTranslations.map(t => `  - ${t.key}: ${t.time}ms`).join('\n') || '  (none)'}

Most Used Keys:
${m.mostUsedKeys.map(k => `  - ${k.key}: ${k.count} times`).join('\n') || '  (none)'}
`.trim()
  }

  /**
   * 导出数据
   */
  const exportData = (): string => {
    return JSON.stringify({
      metrics: metrics.value,
      records: records.slice(-50), // 最近50条
      timestamp: Date.now(),
    }, null, 2)
  }

  // 自动启动
  if (enabled.value) {
    start()
  }

  // 监听 enabled 变化
  watch(enabled, (newValue) => {
    if (newValue) {
      startMonitoring()
    } else {
      stopMonitoring()
    }
  })

  // 清理
  onUnmounted(() => {
    stop()
    stopMonitoring()
  })

  return {
    metrics,
    enabled,
    start,
    stop,
    reset,
    getReport,
    exportData,
  }
}