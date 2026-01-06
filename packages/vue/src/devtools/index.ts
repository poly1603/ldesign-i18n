/**
 * @ldesign/i18n-vue - DevTools Integration
 * Vue DevTools 集成：翻译追踪、实时编辑、性能监控
 *
 * @version 1.0.0
 * @author LDesign Team
 */

import type { App } from 'vue'
import type { I18nInstance, Locale, Messages } from '@ldesign/i18n-core'

// ==================== 类型定义 ====================

/**
 * 翻译使用记录
 */
export interface TranslationUsageRecord {
  /** 翻译键 */
  key: string
  /** 语言 */
  locale: Locale
  /** 翻译结果 */
  result: string
  /** 调用时间 */
  timestamp: number
  /** 调用次数 */
  count: number
  /** 组件名称 */
  componentName?: string
  /** 是否缺失 */
  isMissing: boolean
  /** 使用的参数 */
  params?: Record<string, unknown>
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 总翻译次数 */
  totalTranslations: number
  /** 缓存命中次数 */
  cacheHits: number
  /** 缓存未命中次数 */
  cacheMisses: number
  /** 缓存命中率 */
  cacheHitRate: number
  /** 平均翻译时间 (ms) */
  avgTranslationTime: number
  /** 最慢翻译 */
  slowestTranslation?: { key: string; time: number }
  /** 缺失翻译数量 */
  missingCount: number
}

/**
 * DevTools 面板数据
 */
export interface DevToolsPanelData {
  /** 当前语言 */
  currentLocale: Locale
  /** 可用语言列表 */
  availableLocales: Locale[]
  /** 翻译使用统计 */
  usageStats: TranslationUsageRecord[]
  /** 缺失翻译列表 */
  missingTranslations: string[]
  /** 性能指标 */
  performance: PerformanceMetrics
}

/**
 * DevTools 配置
 */
export interface DevToolsConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 是否追踪翻译使用 */
  trackUsage?: boolean
  /** 是否追踪性能 */
  trackPerformance?: boolean
  /** 最大记录数 */
  maxRecords?: number
  /** 是否显示警告 */
  showWarnings?: boolean
  /** 自定义面板标题 */
  panelTitle?: string
}

// ==================== DevTools 状态管理 ====================

/**
 * DevTools 状态
 */
class DevToolsState {
  /** 翻译使用记录 */
  usageRecords: Map<string, TranslationUsageRecord> = new Map()
  /** 缺失翻译 */
  missingTranslations: Set<string> = new Set()
  /** 性能统计 */
  performanceStats = {
    totalTranslations: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalTime: 0,
    slowestTranslation: null as { key: string; time: number } | null,
  }
  /** 配置 */
  config: Required<DevToolsConfig>

  constructor(config: DevToolsConfig = {}) {
    this.config = {
      enabled: config.enabled ?? (typeof window !== 'undefined' && (window as Record<string, unknown>).__VUE_DEVTOOLS_GLOBAL_HOOK__ !== undefined),
      trackUsage: config.trackUsage ?? true,
      trackPerformance: config.trackPerformance ?? true,
      maxRecords: config.maxRecords ?? 500,
      showWarnings: config.showWarnings ?? true,
      panelTitle: config.panelTitle ?? 'I18n',
    }
  }

  /**
   * 记录翻译使用
   */
  recordUsage(
    key: string,
    locale: Locale,
    result: string,
    isMissing: boolean,
    componentName?: string,
    params?: Record<string, unknown>
  ): void {
    if (!this.config.trackUsage) return

    const recordKey = `${locale}:${key}`
    const existing = this.usageRecords.get(recordKey)

    if (existing) {
      existing.count++
      existing.timestamp = Date.now()
      existing.result = result
    } else {
      // 限制记录数量
      if (this.usageRecords.size >= this.config.maxRecords) {
        const oldestKey = this.usageRecords.keys().next().value
        if (oldestKey) {
          this.usageRecords.delete(oldestKey)
        }
      }

      this.usageRecords.set(recordKey, {
        key,
        locale,
        result,
        timestamp: Date.now(),
        count: 1,
        componentName,
        isMissing,
        params,
      })
    }

    if (isMissing) {
      this.missingTranslations.add(recordKey)
    }
  }

  /**
   * 记录性能
   */
  recordPerformance(key: string, time: number, cacheHit: boolean): void {
    if (!this.config.trackPerformance) return

    this.performanceStats.totalTranslations++
    this.performanceStats.totalTime += time

    if (cacheHit) {
      this.performanceStats.cacheHits++
    } else {
      this.performanceStats.cacheMisses++
    }

    if (!this.performanceStats.slowestTranslation || time > this.performanceStats.slowestTranslation.time) {
      this.performanceStats.slowestTranslation = { key, time }
    }
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const { totalTranslations, cacheHits, cacheMisses, totalTime, slowestTranslation } = this.performanceStats

    return {
      totalTranslations,
      cacheHits,
      cacheMisses,
      cacheHitRate: totalTranslations > 0 ? cacheHits / totalTranslations : 0,
      avgTranslationTime: totalTranslations > 0 ? totalTime / totalTranslations : 0,
      slowestTranslation: slowestTranslation ?? undefined,
      missingCount: this.missingTranslations.size,
    }
  }

  /**
   * 获取使用统计
   */
  getUsageStats(): TranslationUsageRecord[] {
    return Array.from(this.usageRecords.values())
      .sort((a, b) => b.count - a.count)
  }

  /**
   * 获取缺失翻译
   */
  getMissingTranslations(): string[] {
    return Array.from(this.missingTranslations)
  }

  /**
   * 清除统计
   */
  clear(): void {
    this.usageRecords.clear()
    this.missingTranslations.clear()
    this.performanceStats = {
      totalTranslations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalTime: 0,
      slowestTranslation: null,
    }
  }
}

// ==================== 全局状态 ====================

let devToolsState: DevToolsState | null = null
let i18nInstance: I18nInstance | null = null

/**
 * 获取 DevTools 状态
 */
export function getDevToolsState(): DevToolsState | null {
  return devToolsState
}

// ==================== DevTools API ====================

/**
 * I18n DevTools API
 *
 * 提供 Vue DevTools 集成功能。
 */
export const I18nDevTools = {
  /**
   * 安装 DevTools
   */
  install(app: App, i18n: I18nInstance, config?: DevToolsConfig): void {
    devToolsState = new DevToolsState(config)
    i18nInstance = i18n

    if (!devToolsState.config.enabled) {
      return
    }

    // 包装翻译函数以追踪使用
    this.wrapTranslateFunction(i18n)

    // 监听语言切换
    i18n.on('localeChanged', ({ locale }) => {
      this.emitUpdate('locale-changed', { locale })
    })

    // 监听缺失翻译
    i18n.on('missingKey', ({ key, locale }) => {
      if (devToolsState) {
        devToolsState.recordUsage(key ?? '', locale ?? i18n.locale, `[${key}]`, true)
        if (devToolsState.config.showWarnings) {
          console.warn(`[i18n] Missing translation: "${key}" for locale "${locale}"`)
        }
      }
    })

    // 注册到 Vue DevTools
    this.registerDevToolsPlugin(app)

    // 暴露全局 API（用于调试）
    if (typeof window !== 'undefined') {
      (window as Record<string, unknown>).__I18N_DEVTOOLS__ = this
    }
  },

  /**
   * 包装翻译函数
   */
  wrapTranslateFunction(i18n: I18nInstance): void {
    const originalT = i18n.t.bind(i18n)

    // 使用类型断言来处理只读属性
    const mutableI18n = i18n as { t: typeof originalT }
    mutableI18n.t = ((key: string, ...args: unknown[]) => {
      const startTime = performance.now()
      const result = originalT(key, ...args)
      const endTime = performance.now()

      if (devToolsState) {
        const isMissing = result === key || result.startsWith('[')
        const cacheHit = endTime - startTime < 0.1 // 假设 < 0.1ms 为缓存命中

        devToolsState.recordUsage(
          key,
          i18n.locale,
          result,
          isMissing,
          undefined,
          typeof args[0] === 'object' ? args[0] as Record<string, unknown> : undefined
        )
        devToolsState.recordPerformance(key, endTime - startTime, cacheHit)
      }

      return result
    }) as typeof originalT
  },

  /**
   * 注册 Vue DevTools 插件
   */
  registerDevToolsPlugin(app: App): void {
    // 检查 Vue DevTools 是否可用
    const devToolsHook = typeof window !== 'undefined'
      ? (window as Record<string, unknown>).__VUE_DEVTOOLS_GLOBAL_HOOK__
      : null

    if (!devToolsHook) {
      return
    }

    // 这里提供一个简化的 DevTools 集成
    // 完整集成需要使用 @vue/devtools-api
    console.info('[i18n] DevTools integration enabled')
  },

  /**
   * 发送更新事件
   */
  emitUpdate(event: string, data: unknown): void {
    if (typeof window !== 'undefined' && (window as Record<string, unknown>).__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      // 可以通过 DevTools API 发送事件
      console.debug(`[i18n DevTools] ${event}:`, data)
    }
  },

  /**
   * 获取面板数据
   */
  getPanelData(): DevToolsPanelData | null {
    if (!devToolsState || !i18nInstance) {
      return null
    }

    return {
      currentLocale: i18nInstance.locale,
      availableLocales: i18nInstance.getAvailableLocales(),
      usageStats: devToolsState.getUsageStats(),
      missingTranslations: devToolsState.getMissingTranslations(),
      performance: devToolsState.getPerformanceMetrics(),
    }
  },

  /**
   * 切换语言
   */
  async setLocale(locale: Locale): Promise<void> {
    if (i18nInstance) {
      await i18nInstance.setLocale(locale)
    }
  },

  /**
   * 实时编辑翻译
   */
  editTranslation(key: string, value: string, locale?: Locale): void {
    if (!i18nInstance) return

    const targetLocale = locale || i18nInstance.locale
    const messages = i18nInstance.getMessages(targetLocale)

    if (messages) {
      // 设置嵌套值
      const parts = key.split('.')
      let current: Record<string, unknown> = messages as Record<string, unknown>

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]
        if (!(part in current) || typeof current[part] !== 'object') {
          current[part] = {}
        }
        current = current[part] as Record<string, unknown>
      }

      current[parts[parts.length - 1]] = value

      // 更新消息
      i18nInstance.setMessages(targetLocale, messages)

      this.emitUpdate('translation-edited', { key, value, locale: targetLocale })
    }
  },

  /**
   * 导出缺失翻译
   */
  exportMissingTranslations(): string {
    if (!devToolsState) return '[]'

    const missing = devToolsState.getMissingTranslations()
    return JSON.stringify(missing, null, 2)
  },

  /**
   * 获取性能报告
   */
  getPerformanceReport(): PerformanceMetrics | null {
    return devToolsState?.getPerformanceMetrics() ?? null
  },

  /**
   * 清除统计数据
   */
  clearStats(): void {
    devToolsState?.clear()
  },

  /**
   * 获取热门翻译键
   */
  getTopKeys(limit = 10): TranslationUsageRecord[] {
    if (!devToolsState) return []
    return devToolsState.getUsageStats().slice(0, limit)
  },

  /**
   * 搜索翻译
   */
  searchTranslations(query: string, locale?: Locale): Array<{ key: string; value: string }> {
    if (!i18nInstance) return []

    const targetLocale = locale || i18nInstance.locale
    const messages = i18nInstance.getMessages(targetLocale)
    const results: Array<{ key: string; value: string }> = []

    if (!messages) return results

    const searchInMessages = (obj: Messages, prefix = ''): void => {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const fullKey = prefix ? `${prefix}.${key}` : key
          const value = obj[key]

          if (typeof value === 'string') {
            if (
              fullKey.toLowerCase().includes(query.toLowerCase()) ||
              value.toLowerCase().includes(query.toLowerCase())
            ) {
              results.push({ key: fullKey, value })
            }
          } else if (typeof value === 'object' && value !== null) {
            searchInMessages(value as Messages, fullKey)
          }
        }
      }
    }

    searchInMessages(messages)
    return results
  },
}

// ==================== Composable ====================

/**
 * useI18nDevTools 组合式 API
 *
 * @example
 * ```typescript
 * const {
 *   panelData,
 *   topKeys,
 *   missingTranslations,
 *   performance,
 *   editTranslation,
 *   searchTranslations
 * } = useI18nDevTools()
 * ```
 */
export function useI18nDevTools() {
  return {
    /** 获取面板数据 */
    get panelData() {
      return I18nDevTools.getPanelData()
    },

    /** 获取热门翻译键 */
    getTopKeys: (limit?: number) => I18nDevTools.getTopKeys(limit),

    /** 获取缺失翻译 */
    get missingTranslations() {
      return devToolsState?.getMissingTranslations() ?? []
    },

    /** 获取性能指标 */
    get performance() {
      return devToolsState?.getPerformanceMetrics() ?? null
    },

    /** 编辑翻译 */
    editTranslation: I18nDevTools.editTranslation.bind(I18nDevTools),

    /** 搜索翻译 */
    searchTranslations: I18nDevTools.searchTranslations.bind(I18nDevTools),

    /** 导出缺失翻译 */
    exportMissing: I18nDevTools.exportMissingTranslations.bind(I18nDevTools),

    /** 清除统计 */
    clearStats: I18nDevTools.clearStats.bind(I18nDevTools),
  }
}

// ==================== 导出 ====================

export type {
  DevToolsConfig,
  DevToolsPanelData,
  PerformanceMetrics,
  TranslationUsageRecord,
}
