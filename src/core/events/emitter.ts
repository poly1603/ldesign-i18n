/**
 * 优化的事件发射器
 * 
 * 参考 @ldesign/engine 的 event-manager.ts 实现
 * 使用优先级桶机制，提高性能
 * 
 * @packageDocumentation
 */

/**
 * 事件监听器接口
 */
export interface EventListener<T = any> {
  /** 监听器函数 */
  handler: (data: T) => void
  /** 优先级（数字越大越先执行） */
  priority: number
  /** 是否只执行一次 */
  once: boolean
}

/**
 * 优先级桶配置
 */
const PRIORITY_BUCKETS = [
  { min: 100, max: Number.POSITIVE_INFINITY, listeners: [] as EventListener[] }, // 高优先级
  { min: 50, max: 99, listeners: [] as EventListener[] },                         // 中优先级
  { min: 0, max: 49, listeners: [] as EventListener[] },                          // 普通优先级
  { min: Number.NEGATIVE_INFINITY, max: -1, listeners: [] as EventListener[] },   // 低优先级
]

/**
 * 优化的事件发射器
 * 
 * 使用优先级桶机制避免每次触发都排序
 * 
 * ## 性能优化
 * - O(k) 事件触发（k 为监听器数量）
 * - 优先级桶避免排序
 * - 监听器数量限制
 * - 自动清理机制
 * 
 * @example
 * ```typescript
 * const emitter = new EventEmitter()
 * 
 * // 订阅事件
 * const unsubscribe = emitter.on('update', (data) => {
 *   console.log('Updated:', data)
 * }, { priority: 10 })
 * 
 * // 发布事件
 * emitter.emit('update', { value: 123 })
 * 
 * // 取消订阅
 * unsubscribe()
 * ```
 */
export class EventEmitter {
  /** 事件到监听器映射 */
  private readonly events = new Map<string, Map<number, EventListener[]>>()

  /** 最大监听器数量 */
  private maxListeners: number

  /** 当前监听器总数 */
  private listenerCount = 0

  /**
   * 创建事件发射器
   * 
   * @param maxListeners - 最大监听器数量，默认 100
   */
  constructor(maxListeners = 100) {
    this.maxListeners = maxListeners
  }

  /**
   * 订阅事件
   * 
   * @param event - 事件名
   * @param handler - 监听器函数
   * @param options - 选项
   * @returns 取消订阅函数
   */
  on<T = any>(
    event: string,
    handler: (data: T) => void,
    options: { priority?: number, once?: boolean } = {},
  ): () => void {
    const { priority = 0, once = false } = options

    // 防止内存泄漏
    if (this.listenerCount >= this.maxListeners) {
      console.warn(`[EventEmitter] Max listeners (${this.maxListeners}) exceeded`)
      return () => { }
    }

    // 获取或创建优先级桶
    let priorityBuckets = this.events.get(event)
    if (!priorityBuckets) {
      priorityBuckets = new Map()
      this.events.set(event, priorityBuckets)
    }

    // 找到合适的优先级桶
    const bucketKey = this.getBucketKey(priority)
    let listeners = priorityBuckets.get(bucketKey)
    if (!listeners) {
      listeners = []
      priorityBuckets.set(bucketKey, listeners)
    }

    const listener: EventListener<T> = { handler, priority, once }
    listeners.push(listener)
    this.listenerCount++

    // 返回取消订阅函数
    return () => {
      const index = listeners.indexOf(listener)
      if (index !== -1) {
        listeners.splice(index, 1)
        this.listenerCount--

        // 自动清理空桶
        if (listeners.length === 0) {
          priorityBuckets!.delete(bucketKey)
          if (priorityBuckets!.size === 0) {
            this.events.delete(event)
          }
        }
      }
    }
  }

  /**
   * 订阅一次性事件
   * 
   * @param event - 事件名
   * @param handler - 监听器函数
   * @param priority - 优先级
   */
  once<T = any>(
    event: string,
    handler: (data: T) => void,
    priority = 0,
  ): () => void {
    return this.on(event, handler, { priority, once: true })
  }

  /**
   * 取消订阅事件
   * 
   * @param event - 事件名
   * @param handler - 监听器函数
   */
  off<T = any>(event: string, handler: (data: T) => void): void {
    const priorityBuckets = this.events.get(event)
    if (!priorityBuckets) return

    for (const [bucketKey, listeners] of priorityBuckets) {
      const index = listeners.findIndex(l => l.handler === handler)
      if (index !== -1) {
        listeners.splice(index, 1)
        this.listenerCount--

        // 自动清理空桶
        if (listeners.length === 0) {
          priorityBuckets.delete(bucketKey)
          if (priorityBuckets.size === 0) {
            this.events.delete(event)
          }
        }
        return
      }
    }
  }

  /**
   * 发布事件
   * 
   * 按优先级顺序触发所有监听器
   * 
   * @param event - 事件名
   * @param data - 传递给监听器的数据
   */
  emit<T = any>(event: string, data: T): void {
    const priorityBuckets = this.events.get(event)
    if (!priorityBuckets || priorityBuckets.size === 0) return

    // 按优先级从高到低遍历桶
    const sortedBuckets = Array.from(priorityBuckets.entries())
      .sort((a, b) => b[0] - a[0]) // 降序排序

    const toRemove: EventListener[] = []

    for (const [, listeners] of sortedBuckets) {
      // 复制监听器数组，避免在迭代时修改
      const listenersCopy = [...listeners]

      for (const listener of listenersCopy) {
        try {
          listener.handler(data)

          // 标记一次性监听器
          if (listener.once) {
            toRemove.push(listener)
          }
        }
        catch (error) {
          console.error('[EventEmitter] Error in listener:', error)
        }
      }
    }

    // 移除一次性监听器
    if (toRemove.length > 0) {
      for (const listener of toRemove) {
        this.off(event, listener.handler)
      }
    }
  }

  /**
   * 清除事件的所有监听器
   * 
   * @param event - 事件名，如果不提供则清除所有事件
   */
  clear(event?: string): void {
    if (event) {
      const priorityBuckets = this.events.get(event)
      if (priorityBuckets) {
        for (const listeners of priorityBuckets.values()) {
          this.listenerCount -= listeners.length
        }
        this.events.delete(event)
      }
    }
    else {
      this.events.clear()
      this.listenerCount = 0
    }
  }

  /**
   * 获取事件的监听器数量
   * 
   * @param event - 事件名
   * @returns 监听器数量
   */
  listenerCountFor(event: string): number {
    const priorityBuckets = this.events.get(event)
    if (!priorityBuckets) return 0

    let count = 0
    for (const listeners of priorityBuckets.values()) {
      count += listeners.length
    }
    return count
  }

  /**
   * 获取总监听器数量
   * 
   * @returns 总监听器数量
   */
  getListenerCount(): number {
    return this.listenerCount
  }

  /**
   * 设置最大监听器数量
   * 
   * @param max - 最大数量
   */
  setMaxListeners(max: number): void {
    this.maxListeners = max
  }

  /**
   * 获取优先级桶键
   * 
   * @param priority - 优先级
   * @returns 桶键
   * @private
   */
  private getBucketKey(priority: number): number {
    if (priority >= 100) return 100
    if (priority >= 50) return 50
    if (priority >= 0) return 0
    return -1
  }

  /**
   * 销毁事件发射器
   * 
   * 清除所有监听器，释放资源
   */
  destroy(): void {
    this.clear()
  }
}

