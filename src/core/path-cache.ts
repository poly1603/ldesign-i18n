/**
 * 路径编译缓存
 * 
 * 参考 @ldesign/engine 的 state-manager.ts 路径缓存策略
 * 缓存解析后的键路径，避免重复字符串分割
 * 
 * @packageDocumentation
 */

/**
 * 路径分段结果
 */
export interface PathSegments {
  /** 路径分段数组 */
  segments: string[]
  /** 原始路径 */
  original: string
}

/**
 * 路径编译缓存
 * 
 * 缓存路径字符串的解析结果，提高性能
 * 
 * ## 性能优化
 * - O(1) 查找缓存的路径
 * - 避免重复分割字符串
 * - LRU 策略限制缓存大小
 * 
 * @example
 * ```typescript
 * const cache = new PathCache(1000)
 * 
 * // 第一次解析
 * const segments1 = cache.get('user.profile.name')
 * // segments1: ['user', 'profile', 'name']
 * 
 * // 第二次直接从缓存获取
 * const segments2 = cache.get('user.profile.name') // O(1)
 * ```
 */
export class PathCache {
  private cache = new Map<string, PathSegments>()
  private readonly maxSize: number
  private readonly separator: string

  /**
   * 创建路径缓存
   * 
   * @param maxSize - 最大缓存容量，默认 1000
   * @param separator - 路径分隔符，默认 '.'
   */
  constructor(maxSize = 1000, separator = '.') {
    this.maxSize = maxSize
    this.separator = separator
  }

  /**
   * 获取路径分段（带缓存）
   * 
   * @param path - 路径字符串
   * @returns 路径分段结果
   */
  get(path: string): PathSegments {
    // 尝试从缓存获取
    let result = this.cache.get(path)
    if (result) {
      return result
    }

    // 解析路径
    const segments = path.split(this.separator)
    result = { segments, original: path }

    // 检查容量限制
    if (this.cache.size >= this.maxSize) {
      // 简单的 FIFO 策略：删除第一个键
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    // 缓存结果
    this.cache.set(path, result)
    return result
  }

  /**
   * 清除缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 获取缓存统计
   */
  getStats(): {
    size: number
    maxSize: number
    fillRate: number
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      fillRate: this.cache.size / this.maxSize,
    }
  }
}

/**
 * 全局路径缓存实例（单例）
 */
let globalPathCache: PathCache | null = null

/**
 * 获取全局路径缓存
 * 
 * @returns 路径缓存实例
 */
export function getPathCache(): PathCache {
  if (!globalPathCache) {
    globalPathCache = new PathCache()
  }
  return globalPathCache
}

/**
 * 重置全局路径缓存
 */
export function resetPathCache(): void {
  if (globalPathCache) {
    globalPathCache.clear()
  }
  globalPathCache = null
}

/**
 * 解析嵌套路径并获取值
 * 
 * 使用路径缓存优化性能
 * 
 * @param obj - 对象
 * @param path - 路径字符串
 * @param separator - 分隔符，默认 '.'
 * @returns 嵌套值
 * 
 * @example
 * ```typescript
 * const obj = { user: { profile: { name: 'John' } } }
 * const value = getNestedValue(obj, 'user.profile.name') // 'John'
 * ```
 */
export function getNestedValueCached(
  obj: any,
  path: string,
  separator = '.',
): any {
  if (!path || !obj) {
    return undefined
  }

  const cache = getPathCache()
  const { segments } = cache.get(path)

  let current = obj
  for (const segment of segments) {
    if (current == null) {
      return undefined
    }
    current = current[segment]
  }

  return current
}

