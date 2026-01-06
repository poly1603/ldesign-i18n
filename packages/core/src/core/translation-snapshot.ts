/**
 * @ldesign/i18n - Translation Snapshot System
 * 翻译快照系统：状态保存/恢复、时间旅行调试、差异对比
 *
 * @version 1.0.0
 * @author LDesign Team
 */

import type { I18nInstance, Locale, Messages } from '../types'

// ==================== 类型定义 ====================

/**
 * 快照元数据
 */
export interface SnapshotMetadata {
  /** 快照 ID */
  id: string
  /** 快照名称 */
  name: string
  /** 创建时间 */
  createdAt: Date
  /** 描述 */
  description?: string
  /** 标签 */
  tags?: string[]
  /** 当前语言 */
  locale: Locale
  /** 包含的语言列表 */
  locales: Locale[]
  /** 翻译键总数 */
  totalKeys: number
}

/**
 * 翻译快照
 */
export interface TranslationSnapshot {
  /** 元数据 */
  metadata: SnapshotMetadata
  /** 翻译数据 */
  data: Map<Locale, Messages>
  /** 校验和 */
  checksum: string
}

/**
 * 快照差异项
 */
export interface SnapshotDiff {
  /** 差异类型 */
  type: 'added' | 'removed' | 'modified'
  /** 语言 */
  locale: Locale
  /** 键名 */
  key: string
  /** 旧值 */
  oldValue?: string
  /** 新值 */
  newValue?: string
}

/**
 * 快照对比结果
 */
export interface SnapshotComparison {
  /** 源快照 ID */
  sourceId: string
  /** 目标快照 ID */
  targetId: string
  /** 差异列表 */
  diffs: SnapshotDiff[]
  /** 统计信息 */
  stats: {
    added: number
    removed: number
    modified: number
    unchanged: number
  }
}

/**
 * 快照管理器配置
 */
export interface SnapshotManagerConfig {
  /** 最大快照数量 */
  maxSnapshots?: number
  /** 是否自动保存 */
  autoSave?: boolean
  /** 自动保存间隔 (ms) */
  autoSaveInterval?: number
  /** 存储键前缀 */
  storagePrefix?: string
}

/**
 * 序列化的快照格式
 */
interface SerializedSnapshot {
  metadata: Omit<SnapshotMetadata, 'createdAt'> & { createdAt: string }
  data: Record<Locale, Messages>
  checksum: string
}

// ==================== 工具函数 ====================

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `snap_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 计算简单校验和
 */
function calculateChecksum(data: Map<Locale, Messages>): string {
  const str = JSON.stringify(Array.from(data.entries()).sort())
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

/**
 * 获取所有嵌套键
 */
function getAllKeys(messages: Messages, prefix = ''): string[] {
  const keys: string[] = []

  for (const key in messages) {
    if (Object.prototype.hasOwnProperty.call(messages, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const value = messages[key]

      if (typeof value === 'string') {
        keys.push(fullKey)
      } else if (typeof value === 'object' && value !== null) {
        keys.push(...getAllKeys(value as Messages, fullKey))
      }
    }
  }

  return keys
}

/**
 * 获取嵌套值
 */
function getNestedValue(obj: Messages, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = obj

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }

  return typeof current === 'string' ? current : undefined
}

/**
 * 设置嵌套值
 */
function setNestedValue(obj: Messages, path: string, value: string): void {
  const parts = path.split('.')
  let current: Record<string, unknown> = obj as Record<string, unknown>

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {}
    }
    current = current[part] as Record<string, unknown>
  }

  current[parts[parts.length - 1]] = value
}

/**
 * 深拷贝消息对象
 */
function deepCloneMessages(messages: Messages): Messages {
  return JSON.parse(JSON.stringify(messages))
}

// ==================== 主类 ====================

/**
 * 翻译快照管理器
 *
 * 提供翻译状态的快照保存、恢复、时间旅行和差异对比功能。
 *
 * @example
 * ```typescript
 * const snapshots = new TranslationSnapshotManager(i18n, {
 *   maxSnapshots: 50,
 *   autoSave: true,
 *   autoSaveInterval: 5 * 60 * 1000  // 5分钟
 * })
 *
 * // 创建快照
 * const snapshot = snapshots.createSnapshot('v1.0.0', '发布版本')
 *
 * // 修改翻译后...
 *
 * // 对比差异
 * const current = snapshots.createSnapshot('current')
 * const diff = snapshots.compareSnapshots(snapshot.metadata.id, current.metadata.id)
 *
 * // 恢复快照
 * snapshots.restoreSnapshot(snapshot.metadata.id)
 *
 * // 时间旅行
 * snapshots.goBack()
 * snapshots.goForward()
 * ```
 */
export class TranslationSnapshotManager {
  private readonly i18n: I18nInstance
  private readonly config: Required<SnapshotManagerConfig>

  /** 快照列表 */
  private snapshots: Map<string, TranslationSnapshot> = new Map()
  /** 快照历史（用于时间旅行） */
  private history: string[] = []
  /** 当前历史位置 */
  private historyIndex = -1
  /** 自动保存定时器 */
  private autoSaveTimer?: ReturnType<typeof setInterval>

  /**
   * 创建快照管理器实例
   *
   * @param i18n - I18n 实例
   * @param config - 管理器配置
   */
  constructor(i18n: I18nInstance, config: SnapshotManagerConfig = {}) {
    this.i18n = i18n
    this.config = {
      maxSnapshots: config.maxSnapshots ?? 100,
      autoSave: config.autoSave ?? false,
      autoSaveInterval: config.autoSaveInterval ?? 5 * 60 * 1000,
      storagePrefix: config.storagePrefix ?? 'i18n_snapshot_',
    }

    if (this.config.autoSave) {
      this.startAutoSave()
    }
  }

  // ==================== 快照创建 ====================

  /**
   * 创建当前状态的快照
   *
   * @param name - 快照名称
   * @param description - 快照描述
   * @param tags - 标签
   * @returns 创建的快照
   */
  createSnapshot(
    name: string,
    description?: string,
    tags?: string[]
  ): TranslationSnapshot {
    const locales = this.i18n.getAvailableLocales()
    const data = new Map<Locale, Messages>()
    let totalKeys = 0

    for (const locale of locales) {
      const messages = this.i18n.getMessages(locale)
      if (messages) {
        data.set(locale, deepCloneMessages(messages))
        totalKeys += getAllKeys(messages).length
      }
    }

    const id = generateId()
    const snapshot: TranslationSnapshot = {
      metadata: {
        id,
        name,
        createdAt: new Date(),
        description,
        tags,
        locale: this.i18n.locale,
        locales,
        totalKeys,
      },
      data,
      checksum: calculateChecksum(data),
    }

    this.addSnapshot(snapshot)
    return snapshot
  }

  /**
   * 从 JSON 导入快照
   *
   * @param json - JSON 字符串
   * @returns 导入的快照
   */
  importSnapshot(json: string): TranslationSnapshot {
    const parsed: SerializedSnapshot = JSON.parse(json)

    const snapshot: TranslationSnapshot = {
      metadata: {
        ...parsed.metadata,
        createdAt: new Date(parsed.metadata.createdAt),
      },
      data: new Map(Object.entries(parsed.data)),
      checksum: parsed.checksum,
    }

    // 验证校验和
    const calculatedChecksum = calculateChecksum(snapshot.data)
    if (calculatedChecksum !== snapshot.checksum) {
      console.warn('[i18n] 快照校验和不匹配，数据可能已损坏')
    }

    this.addSnapshot(snapshot)
    return snapshot
  }

  /**
   * 导出快照为 JSON
   *
   * @param snapshotId - 快照 ID
   * @returns JSON 字符串
   */
  exportSnapshot(snapshotId: string): string {
    const snapshot = this.snapshots.get(snapshotId)
    if (!snapshot) {
      throw new Error(`快照 ${snapshotId} 不存在`)
    }

    const serialized: SerializedSnapshot = {
      metadata: {
        ...snapshot.metadata,
        createdAt: snapshot.metadata.createdAt.toISOString(),
      },
      data: Object.fromEntries(snapshot.data),
      checksum: snapshot.checksum,
    }

    return JSON.stringify(serialized, null, 2)
  }

  // ==================== 快照恢复 ====================

  /**
   * 恢复到指定快照
   *
   * @param snapshotId - 快照 ID
   * @param options - 恢复选项
   */
  restoreSnapshot(
    snapshotId: string,
    options: { createBackup?: boolean; locales?: Locale[] } = {}
  ): void {
    const snapshot = this.snapshots.get(snapshotId)
    if (!snapshot) {
      throw new Error(`快照 ${snapshotId} 不存在`)
    }

    // 创建备份
    if (options.createBackup !== false) {
      this.createSnapshot(`backup_before_restore_${snapshotId}`, '恢复前自动备份')
    }

    // 恢复数据
    const localesToRestore = options.locales || Array.from(snapshot.data.keys())

    for (const locale of localesToRestore) {
      const messages = snapshot.data.get(locale)
      if (messages) {
        this.i18n.setMessages(locale, deepCloneMessages(messages))
      }
    }

    // 恢复语言设置
    if (!options.locales && snapshot.metadata.locale !== this.i18n.locale) {
      this.i18n.setLocale(snapshot.metadata.locale).catch(console.error)
    }

    // 更新历史
    this.updateHistory(snapshotId)
  }

  /**
   * 部分恢复：只恢复特定键
   *
   * @param snapshotId - 快照 ID
   * @param keys - 要恢复的键列表
   * @param locale - 目标语言（可选，默认恢复所有语言）
   */
  restoreKeys(snapshotId: string, keys: string[], locale?: Locale): void {
    const snapshot = this.snapshots.get(snapshotId)
    if (!snapshot) {
      throw new Error(`快照 ${snapshotId} 不存在`)
    }

    const localesToRestore = locale ? [locale] : Array.from(snapshot.data.keys())

    for (const loc of localesToRestore) {
      const snapshotMessages = snapshot.data.get(loc)
      const currentMessages = this.i18n.getMessages(loc)

      if (snapshotMessages && currentMessages) {
        const newMessages = deepCloneMessages(currentMessages)

        for (const key of keys) {
          const value = getNestedValue(snapshotMessages, key)
          if (value !== undefined) {
            setNestedValue(newMessages, key, value)
          }
        }

        this.i18n.setMessages(loc, newMessages)
      }
    }
  }

  // ==================== 时间旅行 ====================

  /**
   * 回退到上一个快照
   *
   * @returns 是否成功
   */
  goBack(): boolean {
    if (this.historyIndex <= 0) {
      return false
    }

    this.historyIndex--
    const snapshotId = this.history[this.historyIndex]
    this.restoreSnapshot(snapshotId, { createBackup: false })
    return true
  }

  /**
   * 前进到下一个快照
   *
   * @returns 是否成功
   */
  goForward(): boolean {
    if (this.historyIndex >= this.history.length - 1) {
      return false
    }

    this.historyIndex++
    const snapshotId = this.history[this.historyIndex]
    this.restoreSnapshot(snapshotId, { createBackup: false })
    return true
  }

  /**
   * 跳转到指定历史位置
   *
   * @param index - 历史索引
   * @returns 是否成功
   */
  goTo(index: number): boolean {
    if (index < 0 || index >= this.history.length) {
      return false
    }

    this.historyIndex = index
    const snapshotId = this.history[this.historyIndex]
    this.restoreSnapshot(snapshotId, { createBackup: false })
    return true
  }

  /**
   * 获取时间旅行状态
   */
  getTimeTravelState(): {
    canGoBack: boolean
    canGoForward: boolean
    currentIndex: number
    totalSteps: number
    history: Array<{ id: string; name: string; createdAt: Date }>
  } {
    return {
      canGoBack: this.historyIndex > 0,
      canGoForward: this.historyIndex < this.history.length - 1,
      currentIndex: this.historyIndex,
      totalSteps: this.history.length,
      history: this.history.map(id => {
        const snapshot = this.snapshots.get(id)
        return {
          id,
          name: snapshot?.metadata.name || 'Unknown',
          createdAt: snapshot?.metadata.createdAt || new Date(),
        }
      }),
    }
  }

  // ==================== 快照对比 ====================

  /**
   * 对比两个快照
   *
   * @param sourceId - 源快照 ID
   * @param targetId - 目标快照 ID
   * @returns 对比结果
   */
  compareSnapshots(sourceId: string, targetId: string): SnapshotComparison {
    const source = this.snapshots.get(sourceId)
    const target = this.snapshots.get(targetId)

    if (!source) throw new Error(`源快照 ${sourceId} 不存在`)
    if (!target) throw new Error(`目标快照 ${targetId} 不存在`)

    const diffs: SnapshotDiff[] = []
    const stats = { added: 0, removed: 0, modified: 0, unchanged: 0 }

    // 获取所有语言
    const allLocales = new Set([
      ...source.data.keys(),
      ...target.data.keys(),
    ])

    for (const locale of allLocales) {
      const sourceMessages = source.data.get(locale)
      const targetMessages = target.data.get(locale)

      if (!sourceMessages && targetMessages) {
        // 整个语言新增
        const keys = getAllKeys(targetMessages)
        for (const key of keys) {
          diffs.push({
            type: 'added',
            locale,
            key,
            newValue: getNestedValue(targetMessages, key),
          })
          stats.added++
        }
      } else if (sourceMessages && !targetMessages) {
        // 整个语言删除
        const keys = getAllKeys(sourceMessages)
        for (const key of keys) {
          diffs.push({
            type: 'removed',
            locale,
            key,
            oldValue: getNestedValue(sourceMessages, key),
          })
          stats.removed++
        }
      } else if (sourceMessages && targetMessages) {
        // 比较键
        const sourceKeys = new Set(getAllKeys(sourceMessages))
        const targetKeys = new Set(getAllKeys(targetMessages))

        // 检查删除的键
        for (const key of sourceKeys) {
          if (!targetKeys.has(key)) {
            diffs.push({
              type: 'removed',
              locale,
              key,
              oldValue: getNestedValue(sourceMessages, key),
            })
            stats.removed++
          }
        }

        // 检查新增和修改的键
        for (const key of targetKeys) {
          const sourceValue = getNestedValue(sourceMessages, key)
          const targetValue = getNestedValue(targetMessages, key)

          if (!sourceKeys.has(key)) {
            diffs.push({
              type: 'added',
              locale,
              key,
              newValue: targetValue,
            })
            stats.added++
          } else if (sourceValue !== targetValue) {
            diffs.push({
              type: 'modified',
              locale,
              key,
              oldValue: sourceValue,
              newValue: targetValue,
            })
            stats.modified++
          } else {
            stats.unchanged++
          }
        }
      }
    }

    return {
      sourceId,
      targetId,
      diffs,
      stats,
    }
  }

  /**
   * 与当前状态对比
   *
   * @param snapshotId - 快照 ID
   * @returns 对比结果
   */
  compareWithCurrent(snapshotId: string): SnapshotComparison {
    const currentSnapshot = this.createSnapshot('__current__', '当前状态')
    const result = this.compareSnapshots(snapshotId, currentSnapshot.metadata.id)

    // 删除临时快照
    this.deleteSnapshot(currentSnapshot.metadata.id)

    return result
  }

  // ==================== 快照管理 ====================

  /**
   * 获取所有快照
   */
  getAllSnapshots(): TranslationSnapshot[] {
    return Array.from(this.snapshots.values())
      .sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime())
  }

  /**
   * 获取快照
   *
   * @param snapshotId - 快照 ID
   */
  getSnapshot(snapshotId: string): TranslationSnapshot | undefined {
    return this.snapshots.get(snapshotId)
  }

  /**
   * 删除快照
   *
   * @param snapshotId - 快照 ID
   */
  deleteSnapshot(snapshotId: string): boolean {
    const result = this.snapshots.delete(snapshotId)

    // 从历史中移除
    const historyIndex = this.history.indexOf(snapshotId)
    if (historyIndex !== -1) {
      this.history.splice(historyIndex, 1)
      if (this.historyIndex >= historyIndex) {
        this.historyIndex = Math.max(0, this.historyIndex - 1)
      }
    }

    return result
  }

  /**
   * 清空所有快照
   */
  clearAllSnapshots(): void {
    this.snapshots.clear()
    this.history = []
    this.historyIndex = -1
  }

  /**
   * 按标签查找快照
   *
   * @param tag - 标签
   */
  findByTag(tag: string): TranslationSnapshot[] {
    return this.getAllSnapshots()
      .filter(s => s.metadata.tags?.includes(tag))
  }

  /**
   * 获取快照数量
   */
  get snapshotCount(): number {
    return this.snapshots.size
  }

  // ==================== 自动保存 ====================

  /**
   * 启动自动保存
   */
  startAutoSave(): void {
    if (this.autoSaveTimer) {
      return
    }

    this.autoSaveTimer = setInterval(() => {
      this.createSnapshot(
        `auto_${new Date().toISOString()}`,
        '自动保存',
        ['auto']
      )
    }, this.config.autoSaveInterval)
  }

  /**
   * 停止自动保存
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
      this.autoSaveTimer = undefined
    }
  }

  // ==================== 内部方法 ====================

  /**
   * 添加快照并维护最大数量
   */
  private addSnapshot(snapshot: TranslationSnapshot): void {
    this.snapshots.set(snapshot.metadata.id, snapshot)

    // 限制快照数量
    if (this.snapshots.size > this.config.maxSnapshots) {
      const oldestId = this.getAllSnapshots().pop()?.metadata.id
      if (oldestId) {
        this.deleteSnapshot(oldestId)
      }
    }
  }

  /**
   * 更新历史记录
   */
  private updateHistory(snapshotId: string): void {
    // 如果不在历史末尾，截断后面的历史
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1)
    }

    this.history.push(snapshotId)
    this.historyIndex = this.history.length - 1

    // 限制历史长度
    if (this.history.length > this.config.maxSnapshots) {
      this.history.shift()
      this.historyIndex--
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.stopAutoSave()
    this.clearAllSnapshots()
  }
}

/**
 * 创建快照管理器实例
 *
 * @param i18n - I18n 实例
 * @param config - 管理器配置
 * @returns 快照管理器实例
 */
export function createSnapshotManager(
  i18n: I18nInstance,
  config?: SnapshotManagerConfig
): TranslationSnapshotManager {
  return new TranslationSnapshotManager(i18n, config)
}
