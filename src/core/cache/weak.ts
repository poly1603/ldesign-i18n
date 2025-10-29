/**
 * 弱引用缓存实现
 * 
 * @packageDocumentation
 */

/**
 * 弱引用缓存
 * 
 * 使用 WeakMap 存储缓存项，当对象被 GC 时自动清理
 * 
 * @template K - 键类型（必须是对象）
 * @template V - 值类型
 * 
 * @example
 * ```typescript
 * const cache = new WeakCache<object, string>()
 * const key = { id: 123 }
 * cache.set(key, 'value')
 * ```
 */
export class WeakCache<K extends object, V = any> {
  private readonly cache = new WeakMap<K, { value: V, expires?: number }>()

  get(key: K): V | undefined {
    const item = this.cache.get(key)
    if (!item) return undefined

    if (item.expires && Date.now() > item.expires) {
      this.delete(key)
      return undefined
    }

    return item.value
  }

  set(key: K, value: V, ttl?: number): void {
    const expires = ttl ? Date.now() + ttl : undefined
    this.cache.set(key, { value, expires })
  }

  has(key: K): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (item.expires && Date.now() > item.expires) {
      this.delete(key)
      return false
    }

    return true
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  destroy(): void {
    // WeakMap 不需要手动清理
  }
}


