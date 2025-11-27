/**
 * 内存池管理器
 * 
 * 通过对象池技术减少GC压力，提升性能
 */

/**
 * 池化对象接口
 */
export interface Poolable {
  reset(): void
}

/**
 * 对象池配置
 */
export interface PoolOptions<T> {
  /** 初始容量 */
  initialSize?: number
  /** 最大容量 */
  maxSize?: number
  /** 对象工厂函数 */
  factory: () => T
  /** 重置函数 */
  reset: (obj: T) => void
  /** 自动收缩 */
  autoShrink?: boolean
  /** 收缩间隔（毫秒） */
  shrinkInterval?: number
}

/**
 * 通用对象池
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private inUse = new Set<T>()
  private factory: () => T
  private resetFn: (obj: T) => void
  private maxSize: number
  private shrinkTimer?: NodeJS.Timeout

  constructor(options: PoolOptions<T>) {
    this.factory = options.factory
    this.resetFn = options.reset
    this.maxSize = options.maxSize || 100

    // 预创建对象
    const initialSize = options.initialSize || 10
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory())
    }

    // 启动自动收缩
    if (options.autoShrink) {
      this.startAutoShrink(options.shrinkInterval || 60000)
    }
  }

  /**
   * 从池中获取对象
   */
  acquire(): T {
    let obj = this.pool.pop()

    if (!obj) {
      obj = this.factory()
    }

    this.inUse.add(obj)
    return obj
  }

  /**
   * 归还对象到池中
   */
  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      return
    }

    this.inUse.delete(obj)
    this.resetFn(obj)

    // 检查容量限制
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj)
    }
  }

  /**
   * 批量归还
   */
  releaseAll(objects: T[]): void {
    objects.forEach(obj => this.release(obj))
  }

  /**
   * 获取池统计信息
   */
  getStats(): {
    available: number
    inUse: number
    total: number
    utilization: number
  } {
    const available = this.pool.length
    const inUse = this.inUse.size
    const total = available + inUse

    return {
      available,
      inUse,
      total,
      utilization: total > 0 ? inUse / total : 0,
    }
  }

  /**
   * 启动自动收缩
   */
  private startAutoShrink(interval: number): void {
    this.shrinkTimer = setInterval(() => {
      this.shrink()
    }, interval)

    if (typeof (this.shrinkTimer as any)?.unref === 'function') {
      (this.shrinkTimer as any).unref()
    }
  }

  /**
   * 收缩池大小
   */
  shrink(): void {
    const stats = this.getStats()
    
    // 如果使用率低于30%，移除一半的空闲对象
    if (stats.utilization < 0.3 && stats.available > 10) {
      const removeCount = Math.floor(stats.available / 2)
      this.pool.splice(0, removeCount)
    }
  }

  /**
   * 清空池
   */
  clear(): void {
    this.pool = []
    this.inUse.clear()

    if (this.shrinkTimer) {
      clearInterval(this.shrinkTimer)
      this.shrinkTimer = undefined
    }
  }

  /**
   * 预热池（创建对象填充）
   */
  warmup(count: number): void {
    const needed = Math.min(count, this.maxSize - this.pool.length)
    for (let i = 0; i < needed; i++) {
      this.pool.push(this.factory())
    }
  }
}

/**
 * 字符串构建器池
 */
export class StringBuilderPool {
  private pool: string[][] = []
  private readonly maxSize = 50

  /**
   * 获取字符串构建器
   */
  acquire(): string[] {
    return this.pool.pop() || []
  }

  /**
   * 归还字符串构建器
   */
  release(builder: string[]): void {
    if (this.pool.length < this.maxSize) {
      builder.length = 0
      this.pool.push(builder)
    }
  }

  /**
   * 构建字符串并归还
   */
  build(builder: string[], separator = ''): string {
    const result = builder.join(separator)
    this.release(builder)
    return result
  }
}

/**
 * 对象池工厂
 */
export class MemoryPoolFactory {
  private pools = new Map<string, ObjectPool<any>>()

  /**
   * 创建或获取对象池
   */
  getOrCreatePool<T>(name: string, options: PoolOptions<T>): ObjectPool<T> {
    if (!this.pools.has(name)) {
      this.pools.set(name, new ObjectPool(options))
    }
    return this.pools.get(name) as ObjectPool<T>
  }

  /**
   * 获取所有池的统计信息
   */
  getAllStats(): Record<string, ReturnType<ObjectPool<any>['getStats']>> {
    const stats: Record<string, ReturnType<ObjectPool<any>['getStats']>> = {}
    
    this.pools.forEach((pool, name) => {
      stats[name] = pool.getStats()
    })

    return stats
  }

  /**
   * 清空所有池
   */
  clearAll(): void {
    this.pools.forEach(pool => pool.clear())
    this.pools.clear()
  }

  /**
   * 收缩所有池
   */
  shrinkAll(): void {
    this.pools.forEach(pool => pool.shrink())
  }
}

/**
 * 全局内存池工厂实例
 */
export const memoryPools = new MemoryPoolFactory()

/**
 * 创建翻译选项对象池
 */
export function createTranslateOptionsPool() {
  return memoryPools.getOrCreatePool<Record<string, any>>('translateOptions', {
    initialSize: 20,
    maxSize: 100,
    factory: () => ({}),
    reset: (obj) => {
      // 清空对象属性
      Object.keys(obj).forEach(key => delete obj[key])
    },
    autoShrink: true,
  })
}

/**
 * 创建插值参数对象池
 */
export function createInterpolationParamsPool() {
  return memoryPools.getOrCreatePool<Record<string, any>>('interpolationParams', {
    initialSize: 30,
    maxSize: 150,
    factory: () => ({}),
    reset: (obj) => {
      Object.keys(obj).forEach(key => delete obj[key])
    },
    autoShrink: true,
  })
}

/**
 * 字符串构建器池实例
 */
export const stringBuilderPool = new StringBuilderPool()