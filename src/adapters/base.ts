/**
 * 框架适配器基类
 * 
 * 提取所有框架适配器的共同逻辑
 * 
 * @packageDocumentation
 */

import type { I18nInstance, Locale, TranslateOptions } from '../types'

/**
 * 适配器配置
 */
export interface AdapterConfig {
  /** i18n 实例 */
  i18n: I18nInstance
  /** 是否启用响应式 */
  reactive?: boolean
  /** 是否启用缓存 */
  cache?: boolean
}

/**
 * 框架适配器基类
 * 
 * 提供所有框架适配器的通用功能
 * 
 * @example
 * ```typescript
 * class VueAdapter extends BaseAdapter {
 *   // Vue 特定实现
 * }
 * ```
 */
export abstract class BaseAdapter {
  protected readonly i18n: I18nInstance
  protected readonly config: Required<AdapterConfig>
  protected unsubscribers: Array<() => void> = []

  constructor(config: AdapterConfig) {
    this.i18n = config.i18n
    this.config = {
      i18n: config.i18n,
      reactive: config.reactive ?? true,
      cache: config.cache ?? true,
    }
  }

  /**
   * 翻译函数（通用实现）
   */
  t(key: string, params?: Record<string, any>, options?: TranslateOptions): string {
    return this.i18n.t(key, params, options)
  }

  /**
   * 获取当前语言
   */
  getLocale(): Locale {
    return this.i18n.getLocale()
  }

  /**
   * 设置语言
   */
  async setLocale(locale: Locale): Promise<void> {
    return this.i18n.setLocale(locale)
  }

  /**
   * 检查语言是否可用
   */
  hasLocale(locale: Locale): boolean {
    return this.i18n.hasLocale?.(locale) ?? false
  }

  /**
   * 添加翻译消息
   */
  addMessages(locale: Locale, messages: Record<string, any>): void {
    this.i18n.addMessages?.(locale, messages)
  }

  /**
   * 监听语言变化事件
   */
  protected onLocaleChange(callback: (locale: Locale) => void): void {
    if (this.i18n.on) {
      const unsubscribe = this.i18n.on('localeChanged', callback)
      if (typeof unsubscribe === 'function') {
        this.unsubscribers.push(unsubscribe)
      }
    }
  }

  /**
   * 监听翻译加载事件
   */
  protected onMessagesLoaded(callback: (locale: Locale) => void): void {
    if (this.i18n.on) {
      const unsubscribe = this.i18n.on('messagesLoaded', callback)
      if (typeof unsubscribe === 'function') {
        this.unsubscribers.push(unsubscribe)
      }
    }
  }

  /**
   * 销毁适配器
   * 
   * 清理所有事件监听器和资源
   */
  destroy(): void {
    // 取消所有事件订阅
    this.unsubscribers.forEach(unsub => unsub())
    this.unsubscribers = []
  }

  /**
   * 框架特定的响应式实现（由子类实现）
   * 
   * @abstract
   */
  protected abstract setupReactivity(): void

  /**
   * 框架特定的清理逻辑（由子类实现）
   * 
   * @abstract
   */
  protected abstract cleanup(): void
}

/**
 * 创建适配器的辅助函数
 */
export function createAdapterHelper() {
  return {
    /**
     * 创建翻译键列表
     */
    createKeyList(prefix: string, keys: string[]): string[] {
      return keys.map(key => `${prefix}.${key}`)
    },

    /**
     * 批量翻译
     */
    batchTranslate(
      i18n: I18nInstance,
      keys: string[],
      params?: Record<string, any>,
    ): Record<string, string> {
      const result: Record<string, string> = {}

      for (const key of keys) {
        result[key] = i18n.t(key, params)
      }

      return result
    },

    /**
     * 创建作用域翻译函数
     */
    createScopedTranslator(
      i18n: I18nInstance,
      scope: string,
    ): (key: string, params?: Record<string, any>) => string {
      return (key: string, params?: Record<string, any>) => {
        return i18n.t(`${scope}.${key}`, params)
      }
    },
  }
}

