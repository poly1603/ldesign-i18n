/**
 * @ldesign/i18n - Translation Key Preloader
 * 翻译键预加载系统
 */

import type { Locale, Messages } from '../types'

export enum PreloadPriority {
  URGENT = 0,
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3,
  IDLE = 4,
}

interface PreloadItem {
  locale: Locale
  namespace?: string
  keys?: string[]
  priority: PreloadPriority
  expectedUseTime?: number
  frequencyScore?: number
}

interface UsageStats {
  count: number
  lastUsed: number
  avgResponseTime: number
  totalResponseTime: number
}

export interface PreloadStats {
  totalPreloaded: number
  hits: number
  misses: number
  hitRate: number
  timeSaved: number
  preloadedKeys: number
  queueSize: number
  memoryUsage: number
}

export interface PreloaderConfig {
  enabled?: boolean
  maxConcurrent?: number
  timeout?: number
  trackUsage?: boolean
  maxUsageStats?: number
  predictivePreload?: boolean
  preloadDelay?: number
  maxQueueSize?: number
  memoryLimit?: number
}

type LoaderFunction = (locale: Locale, namespace?: string, keys?: string[]) => Promise<Messages>

/**
 * 翻译键预加载器
 *
 * 核心特性:
 * - 频率分析: 跟踪翻译键使用频率，优先预加载高频键
 * - 优先级队列: 基于优先级和预期使用时间智能调度
 * - 预测性预加载: 基于路由和用户行为预测需要的翻译
 * - 内存管理: 监控内存使用，防止过度预加载
 */
export class Preloader {
  private readonly config: Required<PreloaderConfig>
  private readonly loader: LoaderFunction
  private readonly preloadQueue: PreloadItem[] = []
  private readonly preloadedCache = new Map<string, Messages>()
  private readonly usageStats = new Map<string, UsageStats>()
  private readonly loadingItems = new Set<string>()

  private stats = {
    totalPreloaded: 0,
    hits: 0,
    misses: 0,
    timeSaved: 0,
  }

  private currentMemoryUsage = 0
  private isProcessing = false
  private idleCallbackId?: number

  constructor(loader: LoaderFunction, config: PreloaderConfig = {}) {
    this.loader = loader
    this.config = {
      enabled: config.enabled ?? true,
      maxConcurrent: config.maxConcurrent ?? 3,
      timeout: config.timeout ?? 10000,
      trackUsage: config.trackUsage ?? true,
      maxUsageStats: config.maxUsageStats ?? 1000,
      predictivePreload: config.predictivePreload ?? true,
      preloadDelay: config.preloadDelay ?? 100,
      maxQueueSize: config.maxQueueSize ?? 50,
      memoryLimit: config.memoryLimit ?? 10 * 1024 * 1024,
    }
  }

  schedulePreload(item: PreloadItem): void {
    if (!this.config.enabled) return

    if (this.preloadQueue.length >= this.config.maxQueueSize) {
      this.preloadQueue.sort((a, b) => b.priority - a.priority)
      this.preloadQueue.pop()
    }

    const key = this.getCacheKey(item.locale, item.namespace)
    if (this.loadingItems.has(key) || this.preloadedCache.has(key)) return

    if (this.config.trackUsage && item.frequencyScore === undefined) {
      item.frequencyScore = this.calculateFrequencyScore(item.locale, item.namespace)
    }

    this.preloadQueue.push(item)
    this.sortQueue()
    this.processQueue()
  }

  scheduleMultiple(items: PreloadItem[]): void {
    items.forEach(item => this.schedulePreload(item))
  }

  preloadFrequent(locale: Locale, count = 10): void {
    if (!this.config.trackUsage) return

    const frequentKeys = Array.from(this.usageStats.entries())
      .filter(([key]) => key.startsWith(`${locale}:`))
      .sort((a, b) => this.calculateScore(b[1]) - this.calculateScore(a[1]))
      .slice(0, count)

    frequentKeys.forEach(([key]) => {
      const [itemLocale, namespace] = key.split(':')
      this.schedulePreload({
        locale: itemLocale,
        namespace,
        priority: PreloadPriority.MEDIUM,
      })
    })
  }

  predictivePreload(currentRoute: string, locale: Locale): void {
    if (!this.config.predictivePreload) return

    const relatedRoutes = this.predictRelatedRoutes(currentRoute)
    relatedRoutes.forEach((route, index) => {
      const namespace = this.routeToNamespace(route)
      this.schedulePreload({
        locale,
        namespace,
        priority: index === 0 ? PreloadPriority.HIGH : PreloadPriority.MEDIUM,
        expectedUseTime: Date.now() + (index + 1) * 1000,
      })
    })
  }

  recordUsage(locale: Locale, namespace?: string, _keys?: string[], responseTime = 0): void {
    if (!this.config.trackUsage) return

    const key = this.getCacheKey(locale, namespace)
    const now = Date.now()

    if (this.preloadedCache.has(key)) {
      this.stats.hits++
      this.stats.timeSaved += responseTime
    } else {
      this.stats.misses++
    }

    const existing = this.usageStats.get(key)
    if (existing) {
      existing.count++
      existing.lastUsed = now
      existing.totalResponseTime += responseTime
      existing.avgResponseTime = existing.totalResponseTime / existing.count
    } else {
      if (this.usageStats.size >= this.config.maxUsageStats) {
        const leastUsed = this.findLeastUsed()
        if (leastUsed) this.usageStats.delete(leastUsed)
      }

      this.usageStats.set(key, {
        count: 1,
        lastUsed: now,
        avgResponseTime: responseTime,
        totalResponseTime: responseTime,
      })
    }
  }

  getPreloaded(locale: Locale, namespace?: string): Messages | undefined {
    return this.preloadedCache.get(this.getCacheKey(locale, namespace))
  }

  isPreloaded(locale: Locale, namespace?: string): boolean {
    return this.preloadedCache.has(this.getCacheKey(locale, namespace))
  }

  clearCache(locale?: Locale, namespace?: string): void {
    if (locale) {
      const key = this.getCacheKey(locale, namespace)
      const messages = this.preloadedCache.get(key)
      if (messages) {
        this.currentMemoryUsage -= this.estimateSize(messages)
        this.preloadedCache.delete(key)
      }
    } else {
      this.preloadedCache.clear()
      this.currentMemoryUsage = 0
    }
  }

  clearStats(): void {
    this.usageStats.clear()
    this.stats = { totalPreloaded: 0, hits: 0, misses: 0, timeSaved: 0 }
  }

  getStats(): PreloadStats {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? this.stats.hits / total : 0

    return {
      totalPreloaded: this.stats.totalPreloaded,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 10000) / 100,
      timeSaved: this.stats.timeSaved,
      preloadedKeys: this.preloadedCache.size,
      queueSize: this.preloadQueue.length,
      memoryUsage: this.currentMemoryUsage,
    }
  }

  getTopUsed(count = 10): Array<{ key: string; count: number; score: number }> {
    return Array.from(this.usageStats.entries())
      .map(([key, stats]) => ({
        key,
        count: stats.count,
        score: this.calculateScore(stats),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
  }

  destroy(): void {
    if (this.idleCallbackId !== undefined && typeof window !== 'undefined') {
      window.cancelIdleCallback(this.idleCallbackId)
    }
    this.preloadQueue.length = 0
    this.preloadedCache.clear()
    this.usageStats.clear()
    this.loadingItems.clear()
  }

  private async processQueue(): Promise<void> {
    if (!this.config.enabled || this.isProcessing || this.preloadQueue.length === 0) return

    this.isProcessing = true

    try {
      const concurrent: Promise<void>[] = []

      while (this.preloadQueue.length > 0 && concurrent.length < this.config.maxConcurrent) {
        const item = this.preloadQueue.shift()
        if (!item) break

        if (item.priority === PreloadPriority.IDLE) {
          if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            this.idleCallbackId = window.requestIdleCallback(
              () => this.loadItem(item),
              { timeout: this.config.timeout }
            )
            continue
          }
        }

        if (this.config.memoryLimit > 0 && this.currentMemoryUsage >= this.config.memoryLimit) {
          this.evictOldestCache()
        }

        concurrent.push(this.loadItem(item))
      }

      await Promise.allSettled(concurrent)
    } finally {
      this.isProcessing = false
      if (this.preloadQueue.length > 0) {
        setTimeout(() => this.processQueue(), this.config.preloadDelay)
      }
    }
  }

  private async loadItem(item: PreloadItem): Promise<void> {
    const key = this.getCacheKey(item.locale, item.namespace)
    if (this.loadingItems.has(key)) return

    this.loadingItems.add(key)

    try {
      const messages = await Promise.race([
        this.loader(item.locale, item.namespace, item.keys),
        this.createTimeout(this.config.timeout),
      ])

      if (messages) {
        const size = this.estimateSize(messages)
        this.preloadedCache.set(key, messages)
        this.currentMemoryUsage += size
        this.stats.totalPreloaded++
      }
    } catch {
      // Ignore preload errors
    } finally {
      this.loadingItems.delete(key)
    }
  }

  private sortQueue(): void {
    this.preloadQueue.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority
      const scoreA = a.frequencyScore ?? 0
      const scoreB = b.frequencyScore ?? 0
      if (scoreA !== scoreB) return scoreB - scoreA
      const timeA = a.expectedUseTime ?? Infinity
      const timeB = b.expectedUseTime ?? Infinity
      return timeA - timeB
    })
  }

  private calculateFrequencyScore(locale: Locale, namespace?: string): number {
    const stats = this.usageStats.get(this.getCacheKey(locale, namespace))
    return stats ? this.calculateScore(stats) : 0
  }

  private calculateScore(stats: UsageStats): number {
    const now = Date.now()
    const timeSinceLastUse = now - stats.lastUsed
    const recencyFactor = Math.exp(-timeSinceLastUse / (24 * 60 * 60 * 1000))
    return stats.count * recencyFactor
  }

  private predictRelatedRoutes(currentRoute: string): string[] {
    const routes: string[] = []
    const segments = currentRoute.split('/').filter(Boolean)

    if (segments.length > 1) {
      routes.push('/' + segments.slice(0, -1).join('/'))
    }

    const commonNext = ['detail', 'edit', 'list', 'view']
    commonNext.forEach(next => routes.push(currentRoute + '/' + next))

    return routes.slice(0, 3)
  }

  private routeToNamespace(route: string): string {
    return route.replace(/^\//, '').replace(/\//g, '.')
  }

  private findLeastUsed(): string | undefined {
    let leastUsedKey: string | undefined
    let lowestScore = Infinity

    this.usageStats.forEach((stats, key) => {
      const score = this.calculateScore(stats)
      if (score < lowestScore) {
        lowestScore = score
        leastUsedKey = key
      }
    })

    return leastUsedKey
  }

  private evictOldestCache(): void {
    const entries = Array.from(this.preloadedCache.entries())
    if (entries.length === 0) return

    const oldest = entries.reduce((prev, curr) => {
      const prevStats = this.usageStats.get(prev[0])
      const currStats = this.usageStats.get(curr[0])
      const prevTime = prevStats?.lastUsed ?? 0
      const currTime = currStats?.lastUsed ?? 0
      return prevTime < currTime ? prev : curr
    })

    this.currentMemoryUsage -= this.estimateSize(oldest[1])
    this.preloadedCache.delete(oldest[0])
  }

  private getCacheKey(locale: Locale, namespace?: string): string {
    return namespace ? `${locale}:${namespace}` : locale
  }

  private estimateSize(obj: any): number {
    return JSON.stringify(obj).length * 2
  }

  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  }
}

export function createPreloader(
  loader: LoaderFunction,
  config?: PreloaderConfig
): Preloader {
  return new Preloader(loader, config)
}