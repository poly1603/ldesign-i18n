/**
 * 浏览器兼容的 EventEmitter 实现
 * 用于替代 Node.js 的 events 模块
 */

type EventListener = (...args: any[]) => void

/**
 * 事件发射器类
 * 提供与 Node.js EventEmitter 兼容的 API
 */
export class EventEmitter {
  private events: Map<string, Set<EventListener>> = new Map()
  private maxListeners = 10

  /**
   * 添加事件监听器
   * @param event - 事件名称
   * @param listener - 监听器函数
   */
  on(event: string, listener: EventListener): this {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(listener)
    return this
  }

  /**
   * 添加一次性事件监听器
   * @param event - 事件名称
   * @param listener - 监听器函数
   */
  once(event: string, listener: EventListener): this {
    const onceWrapper = (...args: any[]) => {
      listener(...args)
      this.off(event, onceWrapper)
    }
    return this.on(event, onceWrapper)
  }

  /**
   * 移除事件监听器
   * @param event - 事件名称
   * @param listener - 监听器函数
   */
  off(event: string, listener: EventListener): this {
    const listeners = this.events.get(event)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.events.delete(event)
      }
    }
    return this
  }

  /**
   * 移除所有监听器
   * @param event - 事件名称（可选）
   */
  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event)
    }
    else {
      this.events.clear()
    }
    return this
  }

  /**
   * 触发事件
   * @param event - 事件名称
   * @param args - 事件参数
   */
  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event)
    if (!listeners || listeners.size === 0) {
      return false
    }

    for (const listener of listeners) {
      try {
        listener(...args)
      }
      catch (error) {
        console.error(`Error in event listener for "${event}":`, error)
      }
    }

    return true
  }

  /**
   * 获取事件监听器列表
   * @param event - 事件名称
   */
  listeners(event: string): EventListener[] {
    const listeners = this.events.get(event)
    return listeners ? Array.from(listeners) : []
  }

  /**
   * 获取事件监听器数量
   * @param event - 事件名称
   */
  listenerCount(event: string): number {
    const listeners = this.events.get(event)
    return listeners ? listeners.size : 0
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    return Array.from(this.events.keys())
  }

  /**
   * 设置最大监听器数量
   * @param n - 最大数量
   */
  setMaxListeners(n: number): this {
    this.maxListeners = n
    return this
  }

  /**
   * 获取最大监听器数量
   */
  getMaxListeners(): number {
    return this.maxListeners
  }
}

