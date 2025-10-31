/**
 * @ldesign/i18n - Cache System
 * High-performance caching for translations and resources
 */

import type { Cache } from '../types'

/**
 * LRU 缓存节点
 *
 * 双向链表节点,用于维护访问顺序
 * 最近访问的节点在头部,最久未访问的在尾部
 *
 * @template K - 键类型
 * @template V - 值类型
 */
class LRUNode<K, V> {
  /** 缓存键 */
  key: K
  /** 缓存值 */
  value: V
  /** 过期时间戳(毫秒) */
  expires?: number
  /** 前驱节点 */
  prev: LRUNode<K, V> | null = null
  /** 后继节点 */
  next: LRUNode<K, V> | null = null

  constructor(key: K, value: V, expires?: number) {
    this.key = key
    this.value = value
    this.expires = expires
  }
}

/**
 * LRU (Least Recently Used) 缓存实现
 *
 * 使用双向链表 + Map 实现 O(1) 时间复杂度的读写操作
 *
 * ## 数据结构
 * ```
 * head -> [Node1] <-> [Node2] <-> [Node3] <- tail
 *           ↑ 最近访问                ↑ 最久未访问
 * ```
 *
 * ## 特性
 * - O(1) 读取和写入
 * - O(1) LRU 驱逐
 * - 支持 TTL 过期
 * - 自动清理过期项
 * - 缓存命中率统计
 *
 * @template K - 键类型
 * @template V - 值类型
 *
 * @example
 * ```typescript
 * const cache = new LRUCache<string, string>(100, 60000); // 最大100项,60秒过期
 * cache.set('key', 'value');
 * const value = cache.get('key'); // 'value'
 * const stats = cache.getStats(); // { hitRate: 1, missRate: 0, ... }
 * ```
 */
export class LRUCache<K = string, V = any> implements Cache<K, V> {
  /** 最大缓存容量 */
  private readonly maxSize: number
  /** 缓存 Map,用于 O(1) 查找 */
  private readonly cache = new Map<K, LRUNode<K, V>>()
  /** 链表头节点(最近访问) */
  private head: LRUNode<K, V> | null = null
  /** 链表尾节点(最久未访问) */
  private tail: LRUNode<K, V> | null = null
  /** 默认过期时间(毫秒) */
  private defaultTTL?: number
  /** 定期清理定时器 */
  private cleanupTimer?: NodeJS.Timeout
  /** 缓存命中次数 */
  private hits = 0
  /** 缓存未命中次数 */
  private misses = 0

  /**
   * 创建 LRU 缓存实例
   *
   * @param maxSize - 最大缓存容量,默认 1000
   * @param defaultTTL - 默认过期时间(毫秒),可选
   */
  constructor(maxSize = 1000, defaultTTL?: number) {
    this.maxSize = maxSize > 0 ? maxSize : 1000
    this.defaultTTL = defaultTTL

    // 如果设置了TTL,启动定期清理(每60秒)
    if (defaultTTL && typeof setInterval !== 'undefined') {
      this.cleanupTimer = setInterval(() => this.cleanupExpired(), 60000)
      // Node.js 环境下允许进程退出
      if (typeof (this.cleanupTimer as any)?.unref === 'function') {
        (this.cleanupTimer as any).unref()
      }
    }
  }

  /**
   * 获取缓存值
   *
   * 时间复杂度: O(1)
   *
   * @param key - 缓存键
   * @returns 缓存的值,如果不存在或已过期则返回 undefined
   */
  get(key: K): V | undefined {
    const node = this.cache.get(key)

    if (!node) {
      this.misses++
      return undefined
    }

    // 检查是否过期
    if (node.expires && Date.now() > node.expires) {
      this.delete(key)
      this.misses++
      return undefined
    }

    // 移动到头部(最近使用) - O(1)
    this.moveToHead(node)
    this.hits++

    return node.value
  }

  /**
   * 设置缓存值
   *
   * 时间复杂度: O(1)
   * 如果缓存已满,会自动驱逐最久未使用的项(LRU策略)
   *
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 过期时间(毫秒),可选,默认使用构造函数中的 defaultTTL
   */
  set(key: K, value: V, ttl?: number): void {
    let node = this.cache.get(key)

    if (node) {
      // 更新已存在的节点
      node.value = value
      const effectiveTTL = ttl ?? this.defaultTTL
      node.expires = effectiveTTL ? Date.now() + effectiveTTL : undefined
      this.moveToHead(node)
    }
    else {
      // 检查容量,如果已满则移除最久未使用的项
      if (this.cache.size >= this.maxSize && this.tail) {
        // 删除尾节点(最久未使用) - O(1)
        this.cache.delete(this.tail.key)
        this.removeNode(this.tail)
      }

      // 创建新节点
      const effectiveTTL = ttl ?? this.defaultTTL
      const expires = effectiveTTL ? Date.now() + effectiveTTL : undefined
      node = new LRUNode(key, value, expires)

      this.cache.set(key, node)
      this.addToHead(node)
    }
  }

  /**
   * 检查键是否存在且未过期
   *
   * 注意:此方法不会更新访问顺序
   *
   * @param key - 缓存键
   * @returns 是否存在有效的缓存
   */
  has(key: K): boolean {
    const node = this.cache.get(key)

    if (!node) {
      return false
    }

    // 检查是否过期
    if (node.expires && Date.now() > node.expires) {
      this.delete(key)
      return false
    }

    return true
  }

  /**
   * 删除缓存项
   *
   * 时间复杂度: O(1)
   *
   * @param key - 缓存键
   * @returns 是否成功删除
   */
  delete(key: K): boolean {
    const node = this.cache.get(key)
    if (!node)
      return false

    this.removeNode(node)
    return this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   *
   * 重置所有统计数据
   */
  clear(): void {
    this.cache.clear()
    this.head = null
    this.tail = null
    this.hits = 0
    this.misses = 0
  }

  /**
   * 获取当前缓存大小
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 将节点移动到链表头部(最近使用)
   *
   * 时间复杂度: O(1)
   * 操作: 先从当前位置移除,再添加到头部
   *
   * @param node - 要移动的节点
   * @private
   */
  private moveToHead(node: LRUNode<K, V>): void {
    if (this.head === node)
      return
    this.removeNode(node)
    this.addToHead(node)
  }

  /**
   * 将节点添加到链表头部
   *
   * 时间复杂度: O(1)
   *
   * @param node - 要添加的节点
   * @private
   */
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

  /**
   * 从链表中移除节点
   *
   * 时间复杂度: O(1)
   * 操作: 更新前后节点的指针,断开当前节点的连接
   *
   * @param node - 要移除的节点
   * @private
   */
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

    node.prev = null
    node.next = null
  }

  /**
   * 清理过期的缓存项
   *
   * 每次最多清理 10% 或 100 项,避免长时间阻塞
   *
   * @private
   */
  private cleanupExpired(): void {
    if (this.cache.size === 0)
      return

    const now = Date.now()
    const maxCleanup = Math.min(100, Math.ceil(this.cache.size * 0.1))
    let cleaned = 0

    for (const [key, node] of this.cache) {
      if (node.expires && now > node.expires) {
        this.delete(key)
        if (++cleaned >= maxCleanup)
          break
      }
    }
  }

  /**
   * 获取缓存统计信息
   *
   * @returns 包含大小、命中率等统计数据的对象
   */
  getStats(): {
    /** 当前缓存大小 */
    size: number
    /** 最大缓存容量 */
    maxSize: number
    /** 缓存命中率 (0-1) */
    hitRate: number
    /** 缓存未命中率 (0-1) */
    missRate: number
  } {
    const total = this.hits + this.misses
    return {
      size: this.size,
      maxSize: this.maxSize,
      hitRate: total > 0 ? this.hits / total : 0,
      missRate: total > 0 ? this.misses / total : 0,
    }
  }

  /**
   * 销毁缓存,释放所有资源
   *
   * 清理定时器并清空所有缓存数据
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
 * WeakRef polyfill for environments that don't support it
 */
declare global {
  interface WeakRef<T extends object> {
    deref: () => T | undefined
  }
  interface WeakRefConstructor {
    new<T extends object>(target: T): WeakRef<T>
  }
}

/**
 * 内存高效的弱引用缓存
 *
 * 使用 WeakMap 存储缓存项,当对象被 GC 时自动清理
 * 通过全局定时器管理器避免内存泄漏
 *
 * @template K - 键类型(必须是对象)
 * @template V - 值类型
 */
export class WeakCache<K extends object, V = any> {
  private readonly cache = new WeakMap<K, { value: V, expires?: number }>()

  private cleanupTimer?: ReturnType<typeof setTimeout>
  private readonly cleanupInterval = 60000 // 60秒清理一次

  /**
   * 获取缓存值
   *
   * @param key - 缓存键
   * @returns 缓存的值,如果不存在或已过期则返回 undefined
   */
  get(key: K): V | undefined {
    const item = this.cache.get(key)

    if (!item) {
      return undefined
    }

    // 检查是否过期
    if (item.expires && Date.now() > item.expires) {
      this.delete(key)
      return undefined
    }

    return item.value
  }

  /**
   * 设置缓存值
   *
   * 使用定期清理而非单独定时器,避免内存泄漏
   *
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 过期时间(毫秒),可选
   */
  set(key: K, value: V, ttl?: number): void {
    const expires = ttl ? Date.now() + ttl : undefined
    const item = { value, expires }

    this.cache.set(key, item)

    // 启动定期清理(懒加载)
    if (ttl && !this.cleanupTimer) {
      this.startCleanupTimer()
    }
  }

  /**
   * 检查键是否存在且未过期
   *
   * @param key - 缓存键
   * @returns 是否存在有效的缓存
   */
  has(key: K): boolean {
    const item = this.cache.get(key)
    if (!item)
      return false

    // 检查是否过期
    if (item.expires && Date.now() > item.expires) {
      this.delete(key)
      return false
    }

    return true
  }

  /**
   * 删除缓存项
   *
   * @param key - 缓存键
   * @returns 是否成功删除
   */
  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  /**
   * 启动定期清理定时器
   *
   * 使用单个全局定时器而非每个键一个定时器
   * @private
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer)
      return

    this.cleanupTimer = setInterval(() => {
      // WeakMap 无法迭代,过期项会在访问时自然清理
      // 此定时器主要用于保持活跃,实际清理在 get/has 时进行
    }, this.cleanupInterval)

    // Node.js 环境下允许进程退出
    if (typeof (this.cleanupTimer as any)?.unref === 'function') {
      (this.cleanupTimer as any).unref()
    }
  }

  /**
   * 清理所有资源
   *
   * 清理定时器,释放内存
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
  }
}

/**
 * 基于浏览器存储的缓存实现
 *
 * 支持 localStorage 或 sessionStorage 持久化缓存
 * 缓存数据在页面刷新后仍然有效
 *
 * @example
 * ```typescript
 * // 使用 localStorage
 * const cache = new StorageCache(window.localStorage, 'app_', 100);
 * cache.set('user', { name: 'John' });
 *
 * // 刷新页面后仍可访问
 * const user = cache.get('user'); // { name: 'John' }
 * ```
 */
export class StorageCache implements Cache<string, any> {
  /** 存储实例 (localStorage 或 sessionStorage) */
  private storage: Storage
  /** 缓存键前缀,用于隔离不同应用的缓存 */
  private prefix: string
  /** 最大缓存容量 */
  private maxSize: number

  /**
   * 创建存储缓存实例
   *
   * @param storage - 存储实例,默认使用 localStorage
   * @param prefix - 缓存键前缀,默认 'i18n_cache_'
   * @param maxSize - 最大缓存容量,默认 100
   */
  constructor(
    storage: Storage = typeof window !== 'undefined' ? window.localStorage : null!,
    prefix = 'i18n_cache_',
    maxSize = 100,
  ) {
    this.storage = storage
    this.prefix = prefix
    this.maxSize = maxSize
  }

  /**
   * 获取缓存值
   *
   * 从存储中读取并解析 JSON 数据
   *
   * @param key - 缓存键
   * @returns 缓存的值,如果不存在或已过期则返回 undefined
   */
  get(key: string): any {
    if (!this.storage)
      return undefined

    try {
      const item = this.storage.getItem(this.prefix + key)
      if (!item)
        return undefined

      const parsed = JSON.parse(item)

      // 检查是否过期
      if (parsed.expires && Date.now() > parsed.expires) {
        this.delete(key)
        return undefined
      }

      return parsed.value
    }
    catch {
      return undefined
    }
  }

  /**
   * 设置缓存值
   *
   * 将值序列化为 JSON 并存储
   * 如果存储已满,会自动驱逐最旧的项
   *
   * @param key - 缓存键
   * @param value - 缓存值(必须可序列化为 JSON)
   * @param ttl - 过期时间(毫秒),可选
   */
  set(key: string, value: any, ttl?: number): void {
    if (!this.storage)
      return

    try {
      // 检查容量限制
      if (this.size >= this.maxSize) {
        this.evictOldest()
      }

      const expires = ttl ? Date.now() + ttl : undefined
      const item = JSON.stringify({ value, expires, timestamp: Date.now() })

      this.storage.setItem(this.prefix + key, item)
    }
    catch (error) {
      // 存储可能已满或被禁用
      console.warn('Failed to cache item:', error)
    }
  }

  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  delete(key: string): boolean {
    if (!this.storage)
      return false

    try {
      this.storage.removeItem(this.prefix + key)
      return true
    }
    catch {
      return false
    }
  }

  clear(): void {
    if (!this.storage)
      return

    const keysToRemove: string[] = []

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => this.storage.removeItem(key))
  }

  get size(): number {
    if (!this.storage)
      return 0

    let count = 0
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key?.startsWith(this.prefix)) {
        count++
      }
    }
    return count
  }

  private evictOldest(): void {
    if (!this.storage)
      return

    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key?.startsWith(this.prefix)) {
        try {
          const item = this.storage.getItem(key)
          if (item) {
            const parsed = JSON.parse(item)
            if (parsed.timestamp < oldestTime) {
              oldestTime = parsed.timestamp
              oldestKey = key
            }
          }
        }
        catch {
          // Ignore parse errors
        }
      }
    }

    if (oldestKey) {
      this.storage.removeItem(oldestKey)
    }
  }
}

/**
 * 多层缓存系统
 *
 * 组合多个缓存层,实现分层缓存策略
 * 从快速的内存缓存到持久化存储,逐层查找
 *
 * ## 工作原理
 * 1. 读取时从第一层开始查找
 * 2. 如果在较低层找到,会自动提升到上层(缓存预热)
 * 3. 写入时同时写入所有层
 *
 * @template K - 键类型
 * @template V - 值类型
 *
 * @example
 * ```typescript
 * // 创建三层缓存: L1内存 -> L2内存 -> L3持久化
 * const cache = new MultiTierCache(
 *   new LRUCache(50),              // L1: 50项快速缓存
 *   new LRUCache(500),             // L2: 500项内存缓存
 *   new StorageCache(localStorage) // L3: 持久化存储
 * );
 *
 * cache.set('key', 'value');
 * // 从最快的层开始查找
 * const value = cache.get('key');
 * ```
 */
export class MultiTierCache<K = string, V = any> implements Cache<K, V> {
  /** 缓存层数组,从快到慢排序 */
  private tiers: Cache<K, V>[] = []

  /**
   * 创建多层缓存
   *
   * @param tiers - 缓存层数组,按查找顺序排列(快 -> 慢)
   */
  constructor(...tiers: Cache<K, V>[]) {
    this.tiers = tiers
  }

  /**
   * 获取缓存值
   *
   * 从第一层开始查找,如果在较低层找到则提升到上层
   *
   * @param key - 缓存键
   * @returns 缓存的值,如果所有层都未找到则返回 undefined
   */
  get(key: K): V | undefined {
    for (let i = 0; i < this.tiers.length; i++) {
      const value = this.tiers[i].get(key)
      if (value !== undefined) {
        // 提升到更高层(缓存预热)
        for (let j = 0; j < i; j++) {
          this.tiers[j].set(key, value)
        }
        return value
      }
    }
    return undefined
  }

  /**
   * 设置缓存值
   *
   * 同时写入所有缓存层
   *
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 过期时间(毫秒),可选
   */
  set(key: K, value: V, ttl?: number): void {
    // 写入所有层
    this.tiers.forEach(tier => tier.set(key, value, ttl))
  }

  has(key: K): boolean {
    return this.tiers.some(tier => tier.has(key))
  }

  delete(key: K): boolean {
    let deleted = false
    this.tiers.forEach((tier) => {
      if (tier.delete(key)) {
        deleted = true
      }
    })
    return deleted
  }

  clear(): void {
    this.tiers.forEach(tier => tier.clear())
  }

  get size(): number {
    // Return size of the first tier (primary cache)
    return this.tiers[0]?.size || 0
  }
}

/**
 * Create appropriate cache based on environment
 */
export function createCache<K = string, V = any>(
  options: {
    type?: 'memory' | 'storage' | 'multi'
    maxSize?: number
    ttl?: number
    storage?: 'local' | 'session'
  } = {},
): Cache<K, V> {
  const { type = 'memory', maxSize = 1000, ttl, storage = 'local' } = options

  switch (type) {
    case 'storage':
      if (typeof window === 'undefined') {
        // Fallback to memory cache in non-browser environments
        return new LRUCache<K, V>(maxSize, ttl)
      }
      return new StorageCache(
        storage === 'session' ? window.sessionStorage : window.localStorage,
      ) as any

    case 'multi':
      if (typeof window === 'undefined') {
        return new LRUCache<K, V>(maxSize, ttl)
      }
      return new MultiTierCache<K, V>(
        new LRUCache<K, V>(maxSize / 2, ttl),
        new StorageCache(window.localStorage) as any,
      )

    case 'memory':
    default:
      return new LRUCache<K, V>(maxSize, ttl)
  }
}
