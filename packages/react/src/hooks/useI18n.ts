/**
 * useI18n Hook
 * 主 Hook，提供完整的 i18n 功能
 */

import type { I18nInstance, InterpolationParams, Locale, MessageKey, TranslateOptions } from '@ldesign/i18n-core'
import { useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { I18nContext } from '../context/I18nContext'

export interface UseI18nOptions {
  /**
   * 命名空间前缀
   */
  namespace?: string
}

export interface UseI18nReturn {
  // 属性
  /**
   * 当前语言
   */
  locale: Locale

  /**
   * 回退语言
   */
  fallbackLocale: Locale | Locale[]

  /**
   * 当前语言的翻译消息
   */
  messages: Record<string, any>

  /**
   * 可用的语言列表
   */
  availableLocales: Locale[]

  // 翻译函数
  /**
   * 翻译函数
   */
  t: (key: MessageKey, params?: InterpolationParams | TranslateOptions) => string

  /**
   * 检查翻译键是否存在
   */
  te: (key: MessageKey, locale?: Locale) => boolean

  /**
   * 获取原始翻译消息
   */
  tm: (key: MessageKey) => any

  /**
   * 插值原始消息
   */
  rt: (message: string, params?: InterpolationParams) => string

  // 复数化
  /**
   * 复数化翻译
   */
  tc: (key: MessageKey, count: number, params?: InterpolationParams) => string

  /**
   * tc 的别名
   */
  tp: (key: MessageKey, count: number, params?: InterpolationParams) => string

  // 格式化
  /**
   * 日期格式化
   */
  d: (value: Date | number | string, format?: string) => string

  /**
   * 数字格式化
   */
  n: (value: number, format?: string) => string

  // 语言管理
  /**
   * 切换语言
   */
  setLocale: (locale: Locale) => Promise<void>

  /**
   * 获取当前语言
   */
  getLocale: () => Locale

  /**
   * 设置回退语言
   */
  setFallbackLocale: (locale: Locale | Locale[]) => void

  /**
   * 获取回退语言
   */
  getFallbackLocale: () => Locale | Locale[]

  // 消息管理
  /**
   * 合并翻译消息
   */
  mergeLocaleMessage: (locale: Locale, messages: Record<string, any>) => void

  /**
   * 获取翻译消息
   */
  getLocaleMessage: (locale: Locale) => Record<string, any>

  /**
   * 设置翻译消息
   */
  setLocaleMessage: (locale: Locale, messages: Record<string, any>) => void

  // 实例
  /**
   * i18n 实例
   */
  i18n: I18nInstance
}

/**
 * useI18n Hook
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, locale, setLocale } = useI18n()
 *   
 *   return (
 *     <div>
 *       <h1>{t('hello')}</h1>
 *       <button onClick={() => setLocale('en')}>English</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useI18n(options: UseI18nOptions = {}): UseI18nReturn {
  const { namespace } = options
  const context = useContext(I18nContext)

  if (!context || !context.i18n) {
    throw new Error(
      '[useI18n] No i18n instance found. Make sure to wrap your component with <I18nProvider>.',
    )
  }

  const i18n = context.i18n

  // 使用 useSyncExternalStore 订阅 i18n 的语言变化
  const locale = useSyncExternalStore(
    useCallback(
      (callback) => {
        const unsubscribe = i18n.on('localeChanged', callback)
        return () => {
          if (unsubscribe && typeof unsubscribe === 'function') {
            unsubscribe()
          }
        }
      },
      [i18n],
    ),
    () => i18n.locale || 'en',
    () => i18n.locale || 'en',
  )

  // 获取当前消息
  const messages = useMemo(() => i18n.getMessages(locale) || {}, [i18n, locale])

  // 获取可用语言列表
  const availableLocales = useMemo(() => i18n.getAvailableLocales(), [i18n])

  // 翻译函数（带命名空间支持）
  const t = useCallback(
    (key: MessageKey, params?: InterpolationParams | TranslateOptions): string => {
      const actualKey = namespace ? `${namespace}.${key}` : key
      return i18n.t(actualKey, params)
    },
    [i18n, namespace],
  )

  // 检查翻译是否存在
  const te = useCallback(
    (key: MessageKey, checkLocale?: Locale): boolean => {
      const actualKey = namespace ? `${namespace}.${key}` : key
      return i18n.exists(actualKey, { locale: checkLocale })
    },
    [i18n, namespace],
  )

  // 获取原始消息
  const tm = useCallback(
    (key: MessageKey): any => {
      const actualKey = namespace ? `${namespace}.${key}` : key
      const messages = i18n.getMessages(locale)
      if (!messages) return undefined

      const keys = actualKey.split('.')
      let result: any = messages

      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k]
        }
        else {
          return undefined
        }
      }

      return result
    },
    [i18n, locale, namespace],
  )

  // 插值原始消息
  const rt = useCallback(
    (message: string, params?: InterpolationParams): string => {
      if ('interpolation' in i18n && i18n.interpolation) {
        return (i18n as any).interpolation.interpolate(message, params || {}, locale)
      }
      return message
    },
    [i18n, locale],
  )

  // 复数化翻译
  const tc = useCallback(
    (key: MessageKey, count: number, params?: InterpolationParams): string => {
      const actualKey = namespace ? `${namespace}.${key}` : key
      return i18n.plural(actualKey, count, { params })
    },
    [i18n, namespace],
  )

  // 日期格式化
  const d = useCallback(
    (value: Date | number | string, format?: string): string => {
      return i18n.date(value, format ? { dateStyle: format as any } : undefined)
    },
    [i18n],
  )

  // 数字格式化
  const n = useCallback(
    (value: number, format?: string): string => {
      if (format === 'currency') {
        return i18n.currency(value, 'USD')
      }
      else if (format === 'percent') {
        return i18n.number(value, { style: 'percent' })
      }
      return i18n.number(value)
    },
    [i18n],
  )

  // 语言管理
  const setLocale = useCallback(
    async (newLocale: Locale): Promise<void> => {
      await i18n.setLocale(newLocale)
    },
    [i18n],
  )

  const getLocale = useCallback((): Locale => locale, [locale])

  const setFallbackLocale = useCallback(
    (newFallback: Locale | Locale[]): void => {
      i18n.fallbackLocale = newFallback
    },
    [i18n],
  )

  const getFallbackLocale = useCallback(
    (): Locale | Locale[] => i18n.fallbackLocale || 'en',
    [i18n],
  )

  // 消息管理
  const mergeLocaleMessage = useCallback(
    (locale: Locale, messages: Record<string, any>): void => {
      i18n.mergeMessages(locale, messages, namespace)
    },
    [i18n, namespace],
  )

  const getLocaleMessage = useCallback(
    (locale: Locale): Record<string, any> => {
      return i18n.getMessages(locale, namespace) || {}
    },
    [i18n, namespace],
  )

  const setLocaleMessage = useCallback(
    (locale: Locale, messages: Record<string, any>): void => {
      i18n.setMessages(locale, messages, namespace)
    },
    [i18n, namespace],
  )

  return {
    // 属性
    locale,
    fallbackLocale: i18n.fallbackLocale || 'en',
    messages,
    availableLocales,

    // 方法
    t,
    te,
    tm,
    rt,
    tc,
    tp: tc, // 别名
    d,
    n,

    // 语言管理
    setLocale,
    getLocale,
    setFallbackLocale,
    getFallbackLocale,

    // 消息管理
    mergeLocaleMessage,
    getLocaleMessage,
    setLocaleMessage,

    // 实例
    i18n,
  }
}

