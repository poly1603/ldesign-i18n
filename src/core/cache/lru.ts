/**
 * LRU 缓存实现
 * 
 * 使用双向链表 + Map 实现 O(1) 时间复杂度的 LRU 缓存
 * 
 * @packageDocumentation
 */

import type { Cache } from '../../types'
import { NodePool } from './node-pool'
import { estimateSize } from './utils'

/**
 * 双向链表节点
 */
export class LRUNode<K, V> {
  key: K
  value: V
  expires?: number
  accessCount: number
  createdAt: number
  lastAccessed: number
  size: number
  prev: LRUNode<K, V> | null = null
  next: LRUNode<K, V> | null = null

  constructor(key: K, value: V, size: number, expires?: number) {
    this.key = key
    this.value = value
    this.size = size
    this.expires = expires
    this.accessCount = 0
    this.createdAt = Date.now()
    this.lastAccessed = this.createdAt
  }

  reset(key: K, value: V, size: number, expires?: number): void {
    this.key = key
    this.value = value
    this.size = size
    this.expires = expires
    this.accessCount = 0
    this.createdAt = Date.now()
    this.lastAccessed = this.createdAt
    this.prev = null
    this.next = null
  }
}

/**
 * 缓存淘汰策略
 */
export type EvictionStrategy = 'lru' | 'lfu' | 'fifo'

/**
 * LRU 缓存配置
 */
export interface LRUCacheConfig {
  maxSize?: number
  maxMemory?: number
  defaultTTL?: number
  strategy?: EvictionStrategy
  cleanupInterval?: number
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  size: number
  maxSize: number
  hits: number
  misses: number
  hitRate: number
  evictions: number
  memoryUsage: number
}

/**
 * LRU 缓存实现
 * 
 * 高性能 LRU 缓存，支持多种淘汰策略和内存管理
 * 
 * ## 性能特性
 * - O(1) 读取和写入
 * - O(1) LRU 驱逐
 * - 对象池复用节点
 * 
 * @template K - 键类型
 * @template V - 值类型
 * 
 * @example
 * ```typescript
 * const cache = new LRUCache({
 *   maxSize: 1000,
 *   defaultTTL: 300000,
 *   strategy: 'lru',
 * })
 * 
 * cache.set('key', 'value')
 * const value = cache.get('key')
 * ```
 */
export class LRUCache<K = string, V = any> implements Cache<K, V> {
  private readonly cache = new Map<K, LRUNode<K, V>>()
  private readonly config: Required<LRUCacheConfig>
  private readonly nodePool = new NodePool<K, V>()

  private head: LRUNode<K, V> | null = null
  private tail: LRUNode<K, V> | null = null
  private memoryUsage = 0
  private cleanupTimer?: NodeJS.Timeout

  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  }

  constructor(config: LRUCacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize ?? 1000,
      maxMemory: config.maxMemory ?? Number.POSITIVE_INFINITY,
      defaultTTL: config.defaultTTL ?? 0,
      strategy: config.strategy ?? 'lru',
      cleanupInterval: config.cleanupInterval ?? 60000,
    }

    this.startCleanup()
  }

  get(key: K): V | undefined {
    const node = this.cache.get(key)

    if (!node) {
      this.stats.misses++
      return undefined
    }

    if (node.expires && Date.now() > node.expires) {
      this.delete(key)
      this.stats.misses++
      return undefined
    }

    node.accessCount++
    node.lastAccessed = Date.now()

    if (this.config.strategy === 'lru') {
      this.moveToHead(node)
    }

    this.stats.hits++
    return node.value
  }

  set(key: K, value: V, ttl?: number): void {
    const effectiveTTL = ttl ?? this.config.defaultTTL
    const expires = effectiveTTL > 0 ? Date.now() + effectiveTTL : undefined
    const valueSize = estimateSize(value) + estimateSize(key)

    if (this.cache.has(key)) {
      const oldNode = this.cache.get(key)!
      this.memoryUsage -= oldNode.size
      this.removeNode(oldNode)
      this.nodePool.release(oldNode)
    }

    while (this.memoryUsage + valueSize > this.config.maxMemory && this.cache.size > 0) {
      this.evict()
    }

    while (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evict()
    }

    const node = this.nodePool.get(key, value, valueSize, expires)
    this.cache.set(key, node)
    this.addToHead(node)
    this.memoryUsage += valueSize
  }

  has(key: K): boolean {
    const node = this.cache.get(key)
    if (!node) return false

    if (node.expires && Date.now() > node.expires) {
      this.delete(key)
      return false
    }

    return true
  }

  delete(key: K): boolean {
    const node = this.cache.get(key)
    if (!node) return false

    this.memoryUsage -= node.size
    this.removeNode(node)
    this.nodePool.release(node)
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.forEach(node => this.nodePool.release(node))
    this.cache.clear()
    this.head = null
    this.tail = null
    this.memoryUsage = 0
    this.stats = { hits: 0, misses: 0, evictions: 0 }
  }

  get size(): number {
    return this.cache.size
  }

  keys(): K[] {
    return Array.from(this.cache.keys())
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      evictions: this.stats.evictions,
      memoryUsage: this.memoryUsage,
    }
  }

  private cleanup(): void {
    if (this.cache.size === 0) return

    const now = Date.now()
    const maxCleanup = Math.min(100, Math.ceil(this.cache.size * 0.1))
    let cleaned = 0

    for (const [key, node] of this.cache) {
      if (node.expires && now > node.expires) {
        this.delete(key)
        if (++cleaned >= maxCleanup) break
      }
    }
  }

  private evict(): void {
    if (this.cache.size === 0) return

    let keyToEvict: K | undefined

    switch (this.config.strategy) {
      case 'lru':
        if (this.tail) keyToEvict = this.tail.key
        break

      case 'lfu':
        let minAccessCount = Number.POSITIVE_INFINITY
        for (const [key, node] of this.cache) {
          if (node.accessCount < minAccessCount) {
            minAccessCount = node.accessCount
            keyToEvict = key
          }
        }
        break

      case 'fifo':
        let oldestTime = Number.POSITIVE_INFINITY
        for (const [key, node] of this.cache) {
          if (node.createdAt < oldestTime) {
            oldestTime = node.createdAt
            keyToEvict = key
          }
        }
        break
    }

    if (keyToEvict !== undefined) {
      this.delete(keyToEvict)
      this.stats.evictions++
    }
  }

  private addToHead(node: LRUNode<K, V>): void {
    node.next = this.head
    node.prev = null

    if (this.head) {
      this.head.prev = node
    }

    this.head = node

    if (!this.tail) {
      this.tail = node
    }
  }

  private removeNode(node: LRUNode<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next
    }
    else {
      this.head = node.next
    }

    if (node.next) {
      node.next.prev = node.prev
    }
    else {
      this.tail = node.prev
    }
  }

  private moveToHead(node: LRUNode<K, V>): void {
    if (node === this.head) return
    this.removeNode(node)
    this.addToHead(node)
  }

  private startCleanup(): void {
    if (this.config.cleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup()
      }, this.config.cleanupInterval)

      if (typeof (this.cleanupTimer as any)?.unref === 'function') {
        (this.cleanupTimer as any).unref()
      }
    }
  }

  private stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
  }

  destroy(): void {
    this.stopCleanup()
    this.cache.forEach(node => this.nodePool.release(node))
    this.cache.clear()
    this.nodePool.clear()
    this.head = null
    this.tail = null
    this.memoryUsage = 0
  }
}


