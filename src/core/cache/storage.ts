/**
 * 存储缓存实现
 * 
 * 基于 localStorage/sessionStorage 的持久化缓存
 * 
 * @packageDocumentation
 */

import type { Cache } from '../../types'

/**
 * 存储缓存
 * 
 * 基于浏览器存储的持久化缓存
 * 
 * @example
 * ```typescript
 * const cache = new StorageCache(window.localStorage)
 * cache.set('user', { name: 'John' })
 * ```
 */
export class StorageCache implements Cache<string, any> {
  private storage: Storage | null
  private prefix: string
  private maxSize: number
  private memoryCache = new Map<string, { value: any, expires?: number }>()
  private writeTimer?: number
  private pendingWrites = new Map<string, { value: any, ttl?: number }>()
  private readonly writeDelay = 1000

  constructor(
    storage: Storage | null = typeof window !== 'undefined' ? window.localStorage : null,
    prefix = 'i18n_cache_',
    maxSize = 100,
  ) {
    this.storage = storage
    this.prefix = prefix
    this.maxSize = maxSize > 0 ? maxSize : 100

    if (this.storage) {
      this.loadExistingCache()
    }
  }

  private loadExistingCache(): void {
    if (!this.storage) return

    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key?.startsWith(this.prefix)) {
          const item = this.storage.getItem(key)
          if (item) {
            try {
              const parsed = JSON.parse(item)
              const actualKey = key.substring(this.prefix.length)
              this.memoryCache.set(actualKey, {
                value: parsed.value,
                expires: parsed.expires,
              })
            }
            catch { }
          }
        }
      }
    }
    catch { }
  }

  get(key: string): any {
    const cached = this.memoryCache.get(key)
    if (cached) {
      if (cached.expires && Date.now() > cached.expires) {
        this.delete(key)
        return undefined
      }
      return cached.value
    }

    if (!this.storage) return undefined

    try {
      const item = this.storage.getItem(this.prefix + key)
      if (!item) return undefined

      const parsed = JSON.parse(item)

      if (parsed.expires && Date.now() > parsed.expires) {
        this.delete(key)
        return undefined
      }

      this.memoryCache.set(key, {
        value: parsed.value,
        expires: parsed.expires,
      })

      return parsed.value
    }
    catch {
      return undefined
    }
  }

  set(key: string, value: any, ttl?: number): void {
    const expires = ttl ? Date.now() + ttl : undefined
    this.memoryCache.set(key, { value, expires })

    if (this.storage) {
      this.pendingWrites.set(key, { value, ttl })
      this.scheduleWrite()
    }
  }

  private scheduleWrite(): void {
    if (this.writeTimer !== undefined) {
      clearTimeout(this.writeTimer)
    }

    this.writeTimer = (setTimeout(() => {
      this.flushWrites()
      this.writeTimer = undefined
    }, this.writeDelay) as any) as number
  }

  private flushWrites(): void {
    if (!this.storage || this.pendingWrites.size === 0) return

    try {
      if (this.size >= this.maxSize) {
        this.evictOldest()
      }

      this.pendingWrites.forEach(({ value, ttl }, key) => {
        const expires = ttl ? Date.now() + ttl : undefined
        const item = JSON.stringify({
          value,
          expires,
          timestamp: Date.now(),
        })
        this.storage!.setItem(this.prefix + key, item)
      })

      this.pendingWrites.clear()
    }
    catch (error) {
      console.warn('Failed to cache items:', error)
    }
  }

  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  delete(key: string): boolean {
    if (!this.storage) return false

    try {
      this.storage.removeItem(this.prefix + key)
      this.pendingWrites.delete(key)
      this.memoryCache.delete(key)
      return true
    }
    catch {
      return false
    }
  }

  clear(): void {
    if (!this.storage) return

    const keysToRemove: string[] = []

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => this.storage!.removeItem(key))
    this.pendingWrites.clear()
    this.memoryCache.clear()
  }

  get size(): number {
    if (!this.storage) return 0

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
    if (!this.storage) return

    let oldestKey: string | null = null
    let oldestTime = Number.POSITIVE_INFINITY

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
        catch { }
      }
    }

    if (oldestKey) {
      this.storage.removeItem(oldestKey)
    }
  }

  destroy(): void {
    if (this.writeTimer !== undefined) {
      clearTimeout(this.writeTimer)
      this.writeTimer = undefined
    }

    this.flushWrites()
    this.pendingWrites.clear()
    this.memoryCache.clear()
  }
}


