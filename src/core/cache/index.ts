/**
 * 缓存模块导出
 * 
 * @packageDocumentation
 */

export * from './lru'
export * from './weak'
export * from './storage'
export * from './utils'

import type { Cache } from '../../types'
import type { LRUCacheConfig } from './lru'
import { LRUCache } from './lru'
import { StorageCache } from './storage'
import { WeakCache } from './weak'

/**
 * 创建缓存实例
 * 
 * @param options - 缓存配置选项
 * @returns 缓存实例
 * 
 * @example
 * ```typescript
 * const cache = createCache({
 *   type: 'memory',
 *   maxSize: 1000,
 *   defaultTTL: 300000,
 * })
 * ```
 */
export function createCache<K = string, V = any>(
  options: LRUCacheConfig & {
    type?: 'memory' | 'storage' | 'weak'
    storage?: 'local' | 'session'
  } = {},
): Cache<K, V> & { destroy?: () => void } {
  const { type = 'memory', storage = 'local', ...config } = options

  switch (type) {
    case 'storage':
      if (typeof window === 'undefined') {
        return new LRUCache<K, V>(config)
      }
      return new StorageCache(
        storage === 'session' ? window.sessionStorage : window.localStorage,
        'i18n_cache_',
        config.maxSize,
      ) as any

    case 'weak':
      return new WeakCache<K & object, V>() as any

    case 'memory':
    default:
      return new LRUCache<K, V>(config)
  }
}


