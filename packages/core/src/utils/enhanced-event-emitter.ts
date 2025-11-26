/**
 * @ldesign/i18n - Enhanced Event Emitter
 * 增强的事件发射器，支持优先级、一次性监听器和事件日志
 */

/**
 * 事件监听器
 */
export interface EventListener<T = any> {
  /** 回调函数 */
  callback: (data: T) => void
  /** 优先级（数字越大优先级越高） */
  priority: number
  /** 是否为一次性监听器 */
  once: boolean
  /** 监听器ID */
  id: string
  /** 创建时间 */
  createdAt: number
}

/**
 * 事件日志
 */
export interface EventLog {
  /** 事件名称 */
  event: string
  /** 事件数据 */
  data: any
  /** 触发时间 */
  timestamp: number
  /** 监听器数量 */
  listenerCount: number
  /** 执行时长（毫秒） */
  duration?: number
}

/**
 * 事件统计
 */
export interface EventStats {
  /** 事件名称 */
  event: string
  /** 触发次数 */
  emitCount: number
  /** 监听器数量 */
  listenerCount: number
  /** 平均执行时长 */
  avgDuration: number
  /** 最后触发时间 */
  lastEmittedAt: number
}

/**
 * 增强的事件发射器选项
 */
export interface EnhancedEventEmitterOptions {
  /** 是否启用事件日志 */
  enableLogging?: boolean
  /** 最大日志数量 */
  maxLogs?: number
  /** 是否启用性能追踪 */
  enablePerformanceTracking?: boolean
  /** 单个事件最大监听器数量 */
  maxListeners?: number
}

/**
 * 增强的事件发射器
 * 
 * 提供比标准 EventEmitter 更强大的功能：
 * - **优先级系统**: 按优先级顺序执行监听器
 * - **一次性监听器**: 自动清理机制，执行后自动移除
 * - **事件日志**: 追踪所有事件触发历史
 * - **性能监控**: 记录事件执行时长
 * - **统计信息**: 提供详细的事件统计
 * 
 * @example
 * ```typescript
 * const emitter = new EnhancedEventEmitter({
 *   enableLogging: true,
 *   enablePerformanceTracking: true,
 * });
 * 
 * // 添加高优先级监听器
 * emitter.on('localeChange', (locale) => {
 *   console.log('High priority:', locale);
 * }, { priority: 10 });
 * 
 * // 添加一次性监听器
 * emitter.once('firstLoad', () => {
 *   console.log('This will only run once');
 * });
 * 
 * // 查看事件统计
 * const stats = emitter.getStats();
 * console.log('Total events:', stats.length);
 * ```
 */
export class EnhancedEventEmitter {
  private listeners: Map<string, EventListener[]> = new Map()
  private logs: EventLog[] = []
  private stats: Map<string, EventStats> = new Map()
  private options: Required<EnhancedEventEmitterOptions>
  private listenerIdCounter = 0

  constructor(options: EnhancedEventEmitterOptions = {}) {
    this.options = {
      enableLogging: options.enableLogging ?? false,
      maxLogs: options.maxLogs ?? 1000,
      enablePerformanceTracking: options.enablePerformanceTracking ?? false,
      maxListeners: options.maxListeners ?? 100,
    }
  }

  /**
   * 添加事件监听器
   * 
   * @param event - 事件名称
   * @param callback - 回调函数
   * @param options - 监听器选项
   * @returns 监听器ID（用于后续移除）
   */
  on<T = any>(
    event: string,
    callback: (data: T) => void,
    options: { priority?: number; once?: boolean } = {},
  ): string {
    const listener: EventListener<T> = {
      callback,
      priority: options.priority ?? 0,
      once: options.once ?? false,
      id: this.generateListenerId(),
      createdAt: Date.now(),
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }

    const eventListeners = this.listeners.get(event)!

    // 检查监听器数量限制
    if (eventListeners.length >= this.options.maxListeners) {
      console.warn(
        `[EnhancedEventEmitter] Event "${event}" has reached max listeners (${this.options.maxListeners})`,
      )
    }

    // 插入监听器，保持优先级排序（降序）
    let inserted = false
    for (let i = 0; i < eventListeners.length; i++) {
      if (listener.priority > eventListeners[i].priority) {
        eventListeners.splice(i, 0, listener)
        inserted = true
        break
      }
    }

    if (!inserted) {
      eventListeners.push(listener)
    }

    return listener.id
  }

  /**
   * 添加一次性事件监听器
   * 
   * @param event - 事件名称
   * @param callback - 回调函数
   * @param priority - 优先级
   * @returns 监听器ID
   */
  once<T = any>(
    event: string,
    callback: (data: T) => void,
    priority: number = 0,
  ): string {
    return this.on(event, callback, { priority, once: true })
  }

  /**
   * 移除事件监听器
   * 
   * @param event - 事件名称
   * @param listenerIdOrCallback - 监听器ID或回调函数
   * @returns 是否成功移除
   */
  off(event: string, listenerIdOrCallback: string | Function): boolean {
    const eventListeners = this.listeners.get(event)
    if (!eventListeners) {
      return false
    }

    const index = eventListeners.findIndex(
      listener =>
        listener.id === listenerIdOrCallback ||
        listener.callback === listenerIdOrCallback,
    )

    if (index !== -1) {
      eventListeners.splice(index, 1)

      // 如果没有监听器了，删除事件
      if (eventListeners.length === 0) {
        this.listeners.delete(event)
      }

      return true
    }

    return false
  }

  /**
   * 移除所有事件监听器
   * 
   * @param event - 事件名称（可选，不提供则移除所有事件）
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  /**
   * 触发事件
   * 
   * @param event - 事件名称
   * @param data - 事件数据
   */
  emit<T = any>(event: string, data?: T): void {
    const eventListeners = this.listeners.get(event)
    if (!eventListeners || eventListeners.length === 0) {
      return
    }

    const startTime = this.options.enablePerformanceTracking ? performance.now() : 0

    // 按优先级执行监听器（已经排序好）
    const listenersToRemove: string[] = []

    for (const listener of eventListeners) {
      try {
        listener.callback(data as any)

        // 标记一次性监听器待移除
        if (listener.once) {
          listenersToRemove.push(listener.id)
        }
      } catch (error) {
        console.error(`[EnhancedEventEmitter] Error in listener for event "${event}":`, error)
      }
    }

    // 移除一次性监听器
    for (const listenerId of listenersToRemove) {
      this.off(event, listenerId)
    }

    // 记录性能
    const duration = this.options.enablePerformanceTracking
      ? performance.now() - startTime
      : undefined

    // 记录日志
    if (this.options.enableLogging) {
      this.addLog({
        event,
        data,
        timestamp: Date.now(),
        listenerCount: eventListeners.length,
        duration,
      })
    }

    // 更新统计
    this.updateStats(event, duration)
  }

  /**
   * 获取事件监听器数量
   * 
   * @param event - 事件名称
   * @returns 监听器数量
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.length ?? 0
  }

  /**
   * 获取所有事件名称
   * 
   * @returns 事件名称数组
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 获取事件日志
   * 
   * @param event - 事件名称（可选）
   * @param limit - 限制数量
   * @returns 事件日志数组
   */
  getLogs(event?: string, limit?: number): EventLog[] {
    let logs = this.logs

    if (event) {
      logs = logs.filter(log => log.event === event)
    }

    if (limit) {
      logs = logs.slice(-limit)
    }

    return logs
  }

  /**
   * 清空事件日志
   */
  clearLogs(): void {
    this.logs = []
  }

  /**
   * 获取事件统计
   * 
   * @param event - 事件名称（可选）
   * @returns 事件统计数组
   */
  getStats(event?: string): EventStats[] {
    if (event) {
      const stat = this.stats.get(event)
      return stat ? [stat] : []
    }

    return Array.from(this.stats.values())
  }

  /**
   * 重置统计信息
   * 
   * @param event - 事件名称（可选）
   */
  resetStats(event?: string): void {
    if (event) {
      this.stats.delete(event)
    } else {
      this.stats.clear()
    }
  }

  /**
   * 获取所有监听器信息
   * 
   * @param event - 事件名称（可选）
   * @returns 监听器信息数组
   */
  getListeners(event?: string): Array<{
    event: string
    listeners: Array<{
      id: string
      priority: number
      once: boolean
      createdAt: number
    }>
  }> {
    const result: Array<{
      event: string
      listeners: Array<{
        id: string
        priority: number
        once: boolean
        createdAt: number
      }>
    }> = []

    const events = event ? [event] : this.eventNames()

    for (const evt of events) {
      const eventListeners = this.listeners.get(evt)
      if (eventListeners) {
        result.push({
          event: evt,
          listeners: eventListeners.map(listener => ({
            id: listener.id,
            priority: listener.priority,
            once: listener.once,
            createdAt: listener.createdAt,
          })),
        })
      }
    }

    return result
  }

  /**
   * 清理过期的一次性监听器
   * 
   * 移除超过指定时间未触发的一次性监听器
   * 
   * @param maxAge - 最大存活时间（毫秒）
   * @returns 清理的监听器数量
   */
  cleanupStaleOnceListeners(maxAge: number = 3600000): number {
    let count = 0
    const now = Date.now()

    for (const [event, eventListeners] of this.listeners.entries()) {
      const filtered = eventListeners.filter(listener => {
        if (listener.once && now - listener.createdAt > maxAge) {
          count++
          return false
        }
        return true
      })

      if (filtered.length === 0) {
        this.listeners.delete(event)
      } else if (filtered.length !== eventListeners.length) {
        this.listeners.set(event, filtered)
      }
    }

    return count
  }

  /**
   * 导出配置
   * 
   * @returns JSON字符串
   */
  exportConfig(): string {
    return JSON.stringify(
      {
        listeners: this.getListeners(),
        stats: this.getStats(),
        options: this.options,
      },
      null,
      2,
    )
  }

  /**
   * 生成监听器ID
   */
  private generateListenerId(): string {
    return `listener_${++this.listenerIdCounter}_${Date.now()}`
  }

  /**
   * 添加日志
   */
  private addLog(log: EventLog): void {
    this.logs.push(log)

    // 限制日志数量
    if (this.logs.length > this.options.maxLogs) {
      this.logs.shift()
    }
  }

  /**
   * 更新统计
   */
  private updateStats(event: string, duration?: number): void {
    let stat = this.stats.get(event)

    if (!stat) {
      stat = {
        event,
        emitCount: 0,
        listenerCount: this.listenerCount(event),
        avgDuration: 0,
        lastEmittedAt: 0,
      }
      this.stats.set(event, stat)
    }

    stat.emitCount++
    stat.listenerCount = this.listenerCount(event)
    stat.lastEmittedAt = Date.now()

    if (duration !== undefined) {
      // 计算移动平均
      stat.avgDuration = (stat.avgDuration * (stat.emitCount - 1) + duration) / stat.emitCount
    }
  }
}