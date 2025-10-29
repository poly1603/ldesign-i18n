/**
 * @ldesign/i18n - Adaptive Cache System
 * Dynamically adjusts cache size based on usage patterns
 */

import type { Cache } from '../types'

/**
 * Adaptive cache configuration
 */
export interface AdaptiveCacheConfig {
  minSize?: number
  maxSize?: number
  hotSize?: number
  tuneInterval?: number
  promoteThreshold?: number
}

/**
 * Cache entry with access tracking
 */
interface CacheEntry<V> {
  value: V
  accessCount: number
  lastAccess: number
  isHot: boolean
}

/**
 * Adaptive Cache with automatic tuning
 */
export class AdaptiveCache<K = string, V = any> implements Cache<K, V> {
  private readonly hotCache = new Map<K, CacheEntry<V>>()
  private readonly coldCache = new Map<K, CacheEntry<V>>()

  private hotSize: number
  private coldSize: number
  private readonly minSize: number
  private readonly maxSize: number
  private readonly promoteThreshold: number

  private hits = 0
  private misses = 0
  private promotions = 0
  private demotions = 0

  private tuneTimer?: NodeJS.Timeout

  constructor(config: AdaptiveCacheConfig = {}) {
    this.minSize = config.minSize || 20
    this.maxSize = config.maxSize || 1000
    this.hotSize = config.hotSize || 30
    this.coldSize = this.maxSize - this.hotSize
    this.promoteThreshold = config.promoteThreshold || 3

    const tuneInterval = config.tuneInterval || 60000 // 1 minute
    if (tuneInterval > 0) {
      this.startAutoTuning(tuneInterval)
    }
  }

  get(key: K): V | undefined {
    // Check hot cache first
    let entry = this.hotCache.get(key)
    if (entry) {
      entry.accessCount++
      entry.lastAccess = Date.now()
      this.hits++
      return entry.value
    }

    // Check cold cache
    entry = this.coldCache.get(key)
    if (entry) {
      entry.accessCount++
      entry.lastAccess = Date.now()
      this.hits++

      // Promote to hot cache if accessed enough
      if (entry.accessCount >= this.promoteThreshold) {
        this.promote(key, entry)
      }

      return entry.value
    }

    this.misses++
    return undefined
  }

  set(key: K, value: V): void {
    const now = Date.now()

    // Update if exists
    if (this.hotCache.has(key)) {
      const entry = this.hotCache.get(key)!
      entry.value = value
      entry.accessCount++
      entry.lastAccess = now
      return
    }

    if (this.coldCache.has(key)) {
      const entry = this.coldCache.get(key)!
      entry.value = value
      entry.accessCount++
      entry.lastAccess = now

      if (entry.accessCount >= this.promoteThreshold) {
        this.promote(key, entry)
      }
      return
    }

    // Add new entry to cold cache
    const entry: CacheEntry<V> = {
      value,
      accessCount: 1,
      lastAccess: now,
      isHot: false,
    }

    // Evict if cold cache is full
    if (this.coldCache.size >= this.coldSize) {
      this.evictColdest()
    }

    this.coldCache.set(key, entry)
  }

  has(key: K): boolean {
    return this.hotCache.has(key) || this.coldCache.has(key)
  }

  delete(key: K): boolean {
    return this.hotCache.delete(key) || this.coldCache.delete(key)
  }

  clear(): void {
    this.hotCache.clear()
    this.coldCache.clear()
    this.hits = 0
    this.misses = 0
    this.promotions = 0
    this.demotions = 0
  }

  get size(): number {
    return this.hotCache.size + this.coldCache.size
  }

  /**
   * Promote entry from cold to hot cache
   */
  private promote(key: K, entry: CacheEntry<V>): void {
    // Evict from hot if full
    if (this.hotCache.size >= this.hotSize) {
      this.demoteLeastUsed()
    }

    entry.isHot = true
    this.hotCache.set(key, entry)
    this.coldCache.delete(key)
    this.promotions++
  }

  /**
   * Demote least used hot entry to cold cache
   */
  private demoteLeastUsed(): void {
    let minKey: K | undefined
    let minCount = Infinity

    for (const [key, entry] of this.hotCache) {
      if (entry.accessCount < minCount) {
        minCount = entry.accessCount
        minKey = key
      }
    }

    if (minKey !== undefined) {
      const entry = this.hotCache.get(minKey)!
      entry.isHot = false
      entry.accessCount = Math.floor(entry.accessCount / 2) // Decay

      this.hotCache.delete(minKey)

      if (this.coldCache.size < this.coldSize) {
        this.coldCache.set(minKey, entry)
      }

      this.demotions++
    }
  }

  /**
   * Evict coldest (least recently used) entry from cold cache
   */
  private evictColdest(): void {
    let oldestKey: K | undefined
    let oldestTime = Infinity

    for (const [key, entry] of this.coldCache) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess
        oldestKey = key
      }
    }

    if (oldestKey !== undefined) {
      this.coldCache.delete(oldestKey)
    }
  }

  /**
   * Start automatic cache tuning
   */
  private startAutoTuning(interval: number): void {
    this.tuneTimer = setInterval(() => {
      this.autoTune()
    }, interval)

    // Avoid keeping Node.js process alive
    if (typeof (this.tuneTimer as any)?.unref === 'function') {
      (this.tuneTimer as any).unref()
    }
  }

  /**
   * Automatically adjust hot cache size based on hit rate
   */
  private autoTune(): void {
    const total = this.hits + this.misses
    if (total < 100)
      return // Not enough data

    const hitRate = this.hits / total
    const promotionRate = this.hotCache.size > 0 ? this.promotions / this.hotCache.size : 0

    // Increase hot cache if hit rate is high and many promotions
    if (hitRate > 0.9 && promotionRate > 0.5 && this.hotSize < this.maxSize * 0.5) {
      const increase = Math.min(10, Math.floor(this.maxSize * 0.1))
      this.hotSize += increase
      this.coldSize -= increase
    }
    // Decrease hot cache if hit rate is low
    else if (hitRate < 0.7 && this.hotSize > this.minSize) {
      const decrease = Math.min(5, Math.floor(this.hotSize * 0.1))
      this.hotSize -= decrease
      this.coldSize += decrease

      // Demote excess hot entries
      while (this.hotCache.size > this.hotSize) {
        this.demoteLeastUsed()
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    hotSize: number
    coldSize: number
    maxHotSize: number
    maxColdSize: number
    hitRate: number
    missRate: number
    promotions: number
    demotions: number
  } {
    const total = this.hits + this.misses
    return {
      size: this.size,
      hotSize: this.hotCache.size,
      coldSize: this.coldCache.size,
      maxHotSize: this.hotSize,
      maxColdSize: this.coldSize,
      hitRate: total > 0 ? this.hits / total : 0,
      missRate: total > 0 ? this.misses / total : 0,
      promotions: this.promotions,
      demotions: this.demotions,
    }
  }

  /**
   * Clean up
   */
  destroy(): void {
    if (this.tuneTimer) {
      clearInterval(this.tuneTimer)
      this.tuneTimer = undefined
    }
    this.clear()
  }
}

/**
 * Create adaptive cache
 */
export function createAdaptiveCache<K = string, V = any>(
  config?: AdaptiveCacheConfig,
): AdaptiveCache<K, V> {
  return new AdaptiveCache<K, V>(config)
}
