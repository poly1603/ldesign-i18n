/**
 * createI18n - Create a reactive i18n store for Svelte
 */

import type { I18nConfig, I18nInstance, InterpolationParams, Locale, MessageKey, TranslateOptions } from '@ldesign/i18n-core'
import { OptimizedI18n } from '@ldesign/i18n-core'
import { derived, writable, type Readable, type Writable } from 'svelte/store'

export interface I18nStore extends Readable<I18nInstance> {
  /**
   * Core i18n instance
   */
  instance: I18nInstance

  /**
   * Reactive locale store
   */
  locale: Readable<Locale>

  /**
   * Reactive messages store
   */
  messages: Readable<Record<string, any>>

  /**
   * Available locales
   */
  availableLocales: Readable<Locale[]>

  /**
   * Translation function
   */
  t: (key: MessageKey, params?: InterpolationParams | TranslateOptions) => string

  /**
   * Check if translation exists
   */
  te: (key: MessageKey, locale?: Locale) => boolean

  /**
   * Get raw message
   */
  tm: (key: MessageKey) => any

  /**
   * Interpolate raw translation
   */
  rt: (message: string, params?: InterpolationParams) => string

  /**
   * Pluralization
   */
  tc: (key: MessageKey, count: number, params?: InterpolationParams) => string

  /**
   * Alias for tc
   */
  tp: (key: MessageKey, count: number, params?: InterpolationParams) => string

  /**
   * Date formatting
   */
  d: (value: Date | number | string, format?: string) => string

  /**
   * Number formatting
   */
  n: (value: number, format?: string) => string

  /**
   * Set locale
   */
  setLocale: (locale: Locale) => Promise<void>

  /**
   * Get locale
   */
  getLocale: () => Locale

  /**
   * Set fallback locale
   */
  setFallbackLocale: (locale: Locale | Locale[]) => void

  /**
   * Get fallback locale
   */
  getFallbackLocale: () => Locale | Locale[]

  /**
   * Merge locale message
   */
  mergeLocaleMessage: (locale: Locale, messages: Record<string, any>) => void

  /**
   * Get locale message
   */
  getLocaleMessage: (locale: Locale) => Record<string, any>

  /**
   * Set locale message
   */
  setLocaleMessage: (locale: Locale, messages: Record<string, any>) => void
}

/**
 * Create a reactive i18n store
 * 
 * @example
 * ```ts
 * import { createI18n } from '@ldesign/i18n-svelte'
 * 
 * const i18n = createI18n({
 *   locale: 'zh-CN',
 *   messages: {
 *     'zh-CN': { hello: '你好' },
 *     'en': { hello: 'Hello' }
 *   }
 * })
 * 
 * // In component:
 * $i18n.t('hello')
 * ```
 */
export function createI18n(config?: I18nConfig): I18nStore {
  // Create core i18n instance
  const instance = new OptimizedI18n(config)

  // Create writable store for internal state
  const localeStore: Writable<Locale> = writable(instance.locale || 'en')

  // Initialize instance
  if (!instance.initialized) {
    instance.init().catch((error) => {
      console.error('[createI18n] Failed to initialize i18n:', error)
    })
  }

  // Listen to locale changes from instance
  instance.on('localeChanged', ({ locale: newLocale }) => {
    if (newLocale) {
      localeStore.set(newLocale)
    }
  })

  // Create main store (readable)
  const { subscribe } = derived([localeStore], () => instance)

  // Create derived stores
  const locale: Readable<Locale> = derived(localeStore, ($locale) => $locale)

  const messages: Readable<Record<string, any>> = derived(localeStore, ($locale) => {
    return instance.getMessages($locale) || {}
  })

  const availableLocales: Readable<Locale[]> = writable(instance.getAvailableLocales())

  // Translation function
  const t = (key: MessageKey, params?: InterpolationParams | TranslateOptions): string => {
    return instance.t(key, params)
  }

  // Check if translation exists
  const te = (key: MessageKey, checkLocale?: Locale): boolean => {
    return instance.exists(key, { locale: checkLocale })
  }

  // Get raw message
  const tm = (key: MessageKey): any => {
    const currentLocale = instance.locale
    const msgs = instance.getMessages(currentLocale)
    if (!msgs) return undefined

    const keys = key.split('.')
    let result: any = msgs

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        return undefined
      }
    }

    return result
  }

  // Interpolate raw translation
  const rt = (message: string, params?: InterpolationParams): string => {
    if ('interpolation' in instance && instance.interpolation) {
      return (instance as any).interpolation.interpolate(message, params || {}, instance.locale)
    }
    return message
  }

  // Pluralization
  const tc = (key: MessageKey, count: number, params?: InterpolationParams): string => {
    return instance.plural(key, count, { params })
  }

  // Date formatting
  const d = (value: Date | number | string, format?: string): string => {
    return instance.date(value, format ? { dateStyle: format as any } : undefined)
  }

  // Number formatting
  const n = (value: number, format?: string): string => {
    if (format === 'currency') {
      return instance.currency(value, 'USD')
    } else if (format === 'percent') {
      return instance.number(value, { style: 'percent' })
    }
    return instance.number(value)
  }

  // Locale management
  const setLocale = async (newLocale: Locale): Promise<void> => {
    await instance.setLocale(newLocale)
    localeStore.set(newLocale)
  }

  const getLocale = (): Locale => instance.locale || 'en'

  const setFallbackLocale = (newFallback: Locale | Locale[]): void => {
    instance.fallbackLocale = newFallback
  }

  const getFallbackLocale = (): Locale | Locale[] => instance.fallbackLocale || 'en'

  // Message management
  const mergeLocaleMessage = (locale: Locale, msgs: Record<string, any>): void => {
    instance.mergeMessages(locale, msgs)
  }

  const getLocaleMessage = (locale: Locale): Record<string, any> => {
    return instance.getMessages(locale) || {}
  }

  const setLocaleMessage = (locale: Locale, msgs: Record<string, any>): void => {
    instance.setMessages(locale, msgs)
  }

  return {
    subscribe,
    instance,
    locale,
    messages,
    availableLocales,
    t,
    te,
    tm,
    rt,
    tc,
    tp: tc, // Alias
    d,
    n,
    setLocale,
    getLocale,
    setFallbackLocale,
    getFallbackLocale,
    mergeLocaleMessage,
    getLocaleMessage,
    setLocaleMessage,
  }
}

