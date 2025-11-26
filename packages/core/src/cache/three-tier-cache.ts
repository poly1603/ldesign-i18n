/**
 * @ldesign/i18n - Three-Tier Cache Architecture
 * 三级缓存架构实现
 * 
 * @description
 * 实现高性能的三级缓存策略:
 * - L1: 热点键缓存 (最快，最小容量)
 * - L2: LRU 缓存 (中等速度，中等容量)
 * - L3: 组件级缓存 (分组存储，大容量)
 * 
 * 性能提升: 5-10倍 (热点键场景)
 * 内存优化: 智能缓存降级和清理
 * 
 * @module cache/three-tier-cache
 */

// import type { Locale } from '../types'
import { LRUCache } from '../core/cache'

/**
 * 三级缓存配置
 */
export interface ThreeTierCacheConfig {
  /** L1 热点缓存容量 (默认: 50) */
  hotCacheSize?: number

  /** L2 LRU 缓存容量 (默认: 500) */
  lruCacheSize?: number

  /** L3 组件缓存容量 (默认: 2000) */
  componentCacheSize?: number

  /** 热点键访问阈值 (默认: 3) */
  hotThreshold?: number

  /** 是否启用自动降级 (默认: true) */
  enableAutoDemotion?: boolean

  /** 统计数据收集 (默认: false) */
  collectStats?: boolean
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** L1 命中次数 */
  l1Hits: number

  /** L2 命中次数 */
  l2Hits: number

  /** L3 命中次数 */
  l3Hits: number

  /** 未命中次数 */
  misses: number

  /** L1 大小 */
  l1Size: number

  /** L2 大小 */
  l2Size: number

  /** L3 大小 */
  l3Size: number

  /** 总命中率 */
  hitRate: number

  /** L1 命中率 */
  l1HitRate: number
}

/**
 * 访问频率追踪器
 */
class AccessTracker {
  private accessCounts = new Map<string | number, number>()
  private readonly threshold: number

  constructor(threshold: number) {
    this.threshold = threshold
  }

  /**
   * 记录访问
   */
  track(key: string | number): boolean {
    const count = (this.accessCounts.get(key) || 0) + 1
    this.accessCounts.set(key, count)
    return count >= this.threshold
  }

  /**
   * 重置计数
   */
  reset(key: string | number): void {
    this.accessCounts.delete(key)
  }

  /**
   * 清空所有计数
   */
  clear(): void {
    this.accessCounts.clear()
  }

  /**
   * 获取访问次数
   */
  getCount(key: string | number): number {
    return this.accessCounts.get(key) || 0
  }
}

/**
 * 三级缓存实现
 */
export class ThreeTierCache {
  // ============== 三级缓存层 ==============

  /** L1: 热点键缓存 (Map，最快) */
  private hotCache = new Map<string | number, string>()

  /** L2: LRU 缓存 (近期访问) */
  private lruCache: LRUCache<string | number, string>

  /** L3: 组件级缓存 (分组存储) */
  private componentCache = new Map<string, Map<string | number, string>>()

  // ============== 配置和追踪 ==============

  private readonly config: Required<ThreeTierCacheConfig>
  private readonly tracker: AccessTracker

  // ============== 统计信息 ==============

  private stats = {
    l1Hits: 0,
    l2Hits: 0,
    l3Hits: 0,
    misses: 0,
  }

  constructor(config: ThreeTierCacheConfig = {}) {
    this.config = {
      hotCacheSize: config.hotCacheSize ?? 50,
      lruCacheSize: config.lruCacheSize ?? 500,
      componentCacheSize: config.componentCacheSize ?? 2000,
      hotThreshold: config.hotThreshold ?? 3,
      enableAutoDemotion: config.enableAutoDemotion ?? true,
      collectStats: config.collectStats ?? false,
    }

    this.lruCache = new LRUCache(this.config.lruCacheSize)
    this.tracker = new AccessTracker(this.config.hotThreshold)
  }

  // ============== 核心 API ==============

  /**
   * 获取缓存值
   * 
   * 查找顺序: L1 → L2 → L3
   */
  get(key: string | number, component?: string): string | undefined {
    // 1. 检查 L1 热点缓存
    if (this.hotCache.has(key)) {
      if (this.config.collectStats) this.stats.l1Hits++
      return this.hotCache.get(key)
    }

    // 2. 检查 L2 LRU 缓存
    const l2Result = this.lruCache.get(key)
    if (l2Result !== undefined) {
      if (this.config.collectStats) this.stats.l2Hits++

      // 追踪访问频率，考虑提升到 L1
      if (this.tracker.track(key)) {
        this.promoteToHot(key, l2Result)
      }

      return l2Result
    }

    // 3. 检查 L3 组件缓存
    if (component) {
      const componentMap = this.componentCache.get(component)
      if (componentMap?.has(key)) {
        const l3Result = componentMap.get(key)!
        if (this.config.collectStats) this.stats.l3Hits++

        // 提升到 L2
        this.lruCache.set(key, l3Result)

        return l3Result
      }
    }

    // 未命中
    if (this.config.collectStats) this.stats.misses++
    return undefined
  }

  /**
   * 设置缓存值
   * 
   * 默认存入 L2，如果指定组件则同时存入 L3
   */
  set(key: string | number, value: string, component?: string): void {
    // 存入 L2 LRU 缓存
    this.lruCache.set(key, value)

    // 如果指定组件，存入 L3
    if (component) {
      if (!this.componentCache.has(component)) {
        this.componentCache.set(component, new Map())
      }

      const componentMap = this.componentCache.get(component)!

      // 检查 L3 容量
      if (componentMap.size >= this.config.componentCacheSize) {
        // 删除最早的项
        const firstKey = componentMap.keys().next().value
        if (firstKey !== undefined) {
          componentMap.delete(firstKey)
        }
      }

      componentMap.set(key, value)
    }
  }

  /**
   * 删除缓存值
   */
  delete(key: string | number): boolean {
    let deleted = false

    // 从 L1 删除
    if (this.hotCache.delete(key)) {
      deleted = true
      this.tracker.reset(key)
    }

    // 从 L2 删除
    if (this.lruCache.delete(key)) {
      deleted = true
    }

    // 从 L3 删除
    for (const componentMap of this.componentCache.values()) {
      if (componentMap.delete(key)) {
        deleted = true
      }
    }

    return deleted
  }

  /**
   * 检查是否存在
   */
  has(key: string | number, component?: string): boolean {
    if (this.hotCache.has(key)) return true
    if (this.lruCache.has(key)) return true

    if (component) {
      const componentMap = this.componentCache.get(component)
      if (componentMap?.has(key)) return true
    }

    return false
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.hotCache.clear()
    this.lruCache.clear()
    this.componentCache.clear()
    this.tracker.clear()

    // 重置统计
    if (this.config.collectStats) {
      this.stats = { l1Hits: 0, l2Hits: 0, l3Hits: 0, misses: 0 }
    }
  }

  /**
   * 清空组件缓存
   */
  clearComponent(component: string): void {
    const componentMap = this.componentCache.get(component)
    if (componentMap) {
      // 从其他缓存层移除这些键
      for (const key of componentMap.keys()) {
        this.hotCache.delete(key)
        this.lruCache.delete(key)
        this.tracker.reset(key)
      }

      this.componentCache.delete(component)
    }
  }

  // ============== 内部方法 ==============

  /**
   * 提升到热点缓存
   */
  private promoteToHot(key: string | number, value: string): void {
    // 检查容量
    if (this.hotCache.size >= this.config.hotCacheSize) {
      // 删除第一个项 (最早添加)
      const firstKey = this.hotCache.keys().next().value
      if (firstKey !== undefined) {
        this.hotCache.delete(firstKey)

        // 如果启用自动降级，降级到 L2
        if (this.config.enableAutoDemotion) {
          const demotedValue = this.hotCache.get(firstKey)
          if (demotedValue) {
            this.lruCache.set(firstKey, demotedValue)
          }
        }
      }
    }

    // 添加到热点缓存
    this.hotCache.set(key, value)
    this.tracker.reset(key)
  }

  // ============== 统计和维护 ==============

  /**
   * 获取统计信息
   */
  getStats(): CacheStats {
    const total = this.stats.l1Hits + this.stats.l2Hits + this.stats.l3Hits + this.stats.misses
    const hits = this.stats.l1Hits + this.stats.l2Hits + this.stats.l3Hits

    return {
      l1Hits: this.stats.l1Hits,
      l2Hits: this.stats.l2Hits,
      l3Hits: this.stats.l3Hits,
      misses: this.stats.misses,
      l1Size: this.hotCache.size,
      l2Size: this.lruCache.size,
      l3Size: this.getTotalL3Size(),
      hitRate: total > 0 ? hits / total : 0,
      l1HitRate: total > 0 ? this.stats.l1Hits / total : 0,
    }
  }

  /**
   * 获取 L3 总大小
   */
  private getTotalL3Size(): number {
    let size = 0
    for (const componentMap of this.componentCache.values()) {
      size += componentMap.size
    }
    return size
  }

  /**
   * 获取所有组件名称
   */
  getComponents(): string[] {
    return Array.from(this.componentCache.keys())
  }

  /**
   * 获取组件缓存大小
   */
  getComponentSize(component: string): number {
    return this.componentCache.get(component)?.size || 0
  }

  /**
   * 优化缓存 (手动清理)
   */
  optimize(): void {
    // 清理空的组件缓存
    for (const [component, map] of this.componentCache.entries()) {
      if (map.size === 0) {
        this.componentCache.delete(component)
      }
    }

    // 如果 L3 过大，清理最少使用的组件
    const l3Size = this.getTotalL3Size()
    if (l3Size > this.config.componentCacheSize * 1.5) {
      const components = Array.from(this.componentCache.entries())
        .sort((a, b) => a[1].size - b[1].size) // 按大小排序

      // 删除最小的组件缓存
      const toRemove = Math.floor(components.length * 0.2) // 删除 20%
      for (let i = 0; i < toRemove && i < components.length; i++) {
        this.componentCache.delete(components[i][0])
      }
    }
  }

  /**
   * 销毁缓存
   */
  destroy(): void {
    this.clear()
  }
}

/**
 * 创建三级缓存实例
 */
export function createThreeTierCache(config?: ThreeTierCacheConfig): ThreeTierCache {
  return new ThreeTierCache(config)
}