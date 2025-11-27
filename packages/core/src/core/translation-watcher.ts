/**
 * 翻译变更检测器
 * 
 * 监听和检测翻译内容的变化，支持热更新和变更通知
 */

import type { Locale, Messages, MessageKey } from '../types'
import { EventEmitter } from '../utils/helpers'

/**
 * 变更类型
 */
export type ChangeType = 'added' | 'updated' | 'deleted'

/**
 * 翻译变更事件
 */
export interface TranslationChange {
  /** 变更类型 */
  type: ChangeType
  /** 语言 */
  locale: Locale
  /** 翻译键 */
  key: MessageKey
  /** 旧值 */
  oldValue?: string
  /** 新值 */
  newValue?: string
  /** 时间戳 */
  timestamp: number
  /** 命名空间 */
  namespace?: string
}

/**
 * 变更监听器
 */
export type ChangeListener = (change: TranslationChange) => void

/**
 * 监听器选项
 */
export interface WatcherOptions {
  /** 是否启用深度对比 */
  deepCompare?: boolean
  /** 是否记录变更历史 */
  recordHistory?: boolean
  /** 历史记录最大数量 */
  maxHistorySize?: number
  /** 是否自动触发更新事件 */
  autoNotify?: boolean
  /** 批量更新延迟（毫秒） */
  batchDelay?: number
}

/**
 * 翻译变更检测器
 */
export class TranslationWatcher {
  private snapshots = new Map<string, Messages>()
  private changeHistory: TranslationChange[] = []
  private eventEmitter = new EventEmitter()
  private batchTimer?: NodeJS.Timeout
  private pendingChanges: TranslationChange[] = []

  private readonly options: Required<WatcherOptions>

  constructor(options: WatcherOptions = {}) {
    this.options = {
      deepCompare: options.deepCompare ?? true,
      recordHistory: options.recordHistory ?? true,
      maxHistorySize: options.maxHistorySize ?? 500,
      autoNotify: options.autoNotify ?? true,
      batchDelay: options.batchDelay ?? 100,
    }
  }

  /**
   * 创建快照
   */
  snapshot(locale: Locale, messages: Messages, namespace?: string): void {
    const key = this.getSnapshotKey(locale, namespace)
    this.snapshots.set(key, this.deepClone(messages))
  }

  /**
   * 检测变更
   */
  detectChanges(
    locale: Locale,
    newMessages: Messages,
    namespace?: string
  ): TranslationChange[] {
    const key = this.getSnapshotKey(locale, namespace)
    const oldMessages = this.snapshots.get(key)

    if (!oldMessages) {
      // 如果没有快照，创建一个并返回空数组
      this.snapshot(locale, newMessages, namespace)
      return []
    }

    const changes = this.compareMessages(
      oldMessages,
      newMessages,
      locale,
      namespace
    )

    // 更新快照
    this.snapshot(locale, newMessages, namespace)

    // 记录历史
    if (this.options.recordHistory && changes.length > 0) {
      this.recordChanges(changes)
    }

    // 触发事件
    if (this.options.autoNotify && changes.length > 0) {
      this.notifyChanges(changes)
    }

    return changes
  }

  /**
   * 比较消息对象
   */
  private compareMessages(
    oldMessages: Messages,
    newMessages: Messages,
    locale: Locale,
    namespace?: string,
    prefix = ''
  ): TranslationChange[] {
    const changes: TranslationChange[] = []
    const timestamp = Date.now()

    // 检查新增和更新
    Object.keys(newMessages).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const newValue = newMessages[key]
      const oldValue = oldMessages[key]

      if (typeof newValue === 'object' && newValue !== null && !Array.isArray(newValue)) {
        // 递归比较嵌套对象
        if (this.options.deepCompare) {
          const nestedOld = (typeof oldValue === 'object' && oldValue !== null) ? oldValue as Messages : {}
          changes.push(...this.compareMessages(
            nestedOld,
            newValue as Messages,
            locale,
            namespace,
            fullKey
          ))
        }
      } else {
        const newStr = String(newValue)
        const oldStr = oldValue !== undefined ? String(oldValue) : undefined

        if (oldStr === undefined) {
          // 新增
          changes.push({
            type: 'added',
            locale,
            key: fullKey,
            newValue: newStr,
            timestamp,
            namespace,
          })
        } else if (newStr !== oldStr) {
          // 更新
          changes.push({
            type: 'updated',
            locale,
            key: fullKey,
            oldValue: oldStr,
            newValue: newStr,
            timestamp,
            namespace,
          })
        }
      }
    })

    // 检查删除
    Object.keys(oldMessages).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const oldValue = oldMessages[key]
      const newValue = newMessages[key]

      if (newValue === undefined) {
        if (typeof oldValue === 'object' && oldValue !== null && !Array.isArray(oldValue)) {
          // 递归处理删除的嵌套对象
          if (this.options.deepCompare) {
            this.collectDeletedKeys(oldValue as Messages, fullKey).forEach(deletedKey => {
              changes.push({
                type: 'deleted',
                locale,
                key: deletedKey,
                oldValue: String(this.getNestedValue(oldMessages, deletedKey)),
                timestamp,
                namespace,
              })
            })
          }
        } else {
          changes.push({
            type: 'deleted',
            locale,
            key: fullKey,
            oldValue: String(oldValue),
            timestamp,
            namespace,
          })
        }
      }
    })

    return changes
  }

  /**
   * 收集被删除的键
   */
  private collectDeletedKeys(obj: Messages, prefix: string): string[] {
    const keys: string[] = []

    Object.keys(obj).forEach(key => {
      const fullKey = `${prefix}.${key}`
      const value = obj[key]

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...this.collectDeletedKeys(value as Messages, fullKey))
      } else {
        keys.push(fullKey)
      }
    })

    return keys
  }

  /**
   * 获取嵌套值
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return undefined
      }
    }

    return current
  }

  /**
   * 记录变更历史
   */
  private recordChanges(changes: TranslationChange[]): void {
    this.changeHistory.push(...changes)

    // 限制历史记录大小
    if (this.changeHistory.length > this.options.maxHistorySize) {
      this.changeHistory = this.changeHistory.slice(-this.options.maxHistorySize)
    }
  }

  /**
   * 通知变更（支持批量延迟）
   */
  private notifyChanges(changes: TranslationChange[]): void {
    if (this.options.batchDelay > 0) {
      // 批量模式
      this.pendingChanges.push(...changes)

      if (this.batchTimer) {
        clearTimeout(this.batchTimer)
      }

      this.batchTimer = setTimeout(() => {
        this.flushPendingChanges()
      }, this.options.batchDelay)
    } else {
      // 立即模式
      changes.forEach(change => {
        this.eventEmitter.emit('change', change)
        this.eventEmitter.emit(change.type, change)
      })
    }
  }

  /**
   * 刷新待处理的变更
   */
  private flushPendingChanges(): void {
    if (this.pendingChanges.length === 0) {
      return
    }

    const changes = [...this.pendingChanges]
    this.pendingChanges = []

    // 触发批量事件
    this.eventEmitter.emit('batchChange', changes)

    // 触发单个事件
    changes.forEach(change => {
      this.eventEmitter.emit('change', change)
      this.eventEmitter.emit(change.type, change)
    })
  }

  /**
   * 监听所有变更
   */
  onChange(listener: ChangeListener): () => void {
    this.eventEmitter.on('change', listener)
    return () => this.eventEmitter.off('change', listener)
  }

  /**
   * 监听新增
   */
  onAdded(listener: ChangeListener): () => void {
    this.eventEmitter.on('added', listener)
    return () => this.eventEmitter.off('added', listener)
  }

  /**
   * 监听更新
   */
  onUpdated(listener: ChangeListener): () => void {
    this.eventEmitter.on('updated', listener)
    return () => this.eventEmitter.off('updated', listener)
  }

  /**
   * 监听删除
   */
  onDeleted(listener: ChangeListener): () => void {
    this.eventEmitter.on('deleted', listener)
    return () => this.eventEmitter.off('deleted', listener)
  }

  /**
   * 监听批量变更
   */
  onBatchChange(listener: (changes: TranslationChange[]) => void): () => void {
    this.eventEmitter.on('batchChange', listener)
    return () => this.eventEmitter.off('batchChange', listener)
  }

  /**
   * 获取变更历史
   */
  getHistory(limit?: number): TranslationChange[] {
    if (limit) {
      return this.changeHistory.slice(-limit)
    }
    return [...this.changeHistory]
  }

  /**
   * 获取特定键的变更历史
   */
  getKeyHistory(key: MessageKey): TranslationChange[] {
    return this.changeHistory.filter(change => change.key === key)
  }

  /**
   * 获取特定语言的变更历史
   */
  getLocaleHistory(locale: Locale): TranslationChange[] {
    return this.changeHistory.filter(change => change.locale === locale)
  }

  /**
   * 清空历史
   */
  clearHistory(): void {
    this.changeHistory = []
  }

  /**
   * 获取快照键
   */
  private getSnapshotKey(locale: Locale, namespace?: string): string {
    return namespace ? `${locale}:${namespace}` : locale
  }

  /**
   * 深度克隆
   */
  private deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item))
    }

    const cloned: any = {}
    Object.keys(obj).forEach(key => {
      cloned[key] = this.deepClone(obj[key])
    })

    return cloned
  }

  /**
   * 清空所有快照
   */
  clearSnapshots(): void {
    this.snapshots.clear()
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = undefined
    }
    this.snapshots.clear()
    this.changeHistory = []
    this.pendingChanges = []
    this.eventEmitter.removeAllListeners()
  }
}

/**
 * 创建翻译变更检测器
 */
export function createTranslationWatcher(options?: WatcherOptions): TranslationWatcher {
  return new TranslationWatcher(options)
}