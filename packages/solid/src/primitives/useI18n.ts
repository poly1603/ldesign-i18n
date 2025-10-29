/**
 * useI18n - Main primitive for Solid i18n
 */

import type { InterpolationParams, Locale, MessageKey, TranslateOptions } from '@ldesign/i18n-core'
import { createEffect, createMemo, createSignal, onCleanup, useContext } from 'solid-js'
import type { Accessor } from 'solid-js'
import { I18nContext } from '../context/I18nContext'

export interface UseI18nOptions {
  /**
   * Namespace prefix for translations
   */
  namespace?: string
}

export interface UseI18nReturn {
  // Properties (reactive)
  locale: Accessor<Locale>
  fallbackLocale: Accessor<Locale | Locale[]>
  messages: Accessor<Record<string, any>>
  availableLocales: Accessor<Locale[]>

  // Translation functions
  t: (key: MessageKey, params?: InterpolationParams | TranslateOptions) => string
  te: (key: MessageKey, locale?: Locale) => boolean
  tm: (key: MessageKey) => any
  rt: (message: string, params?: InterpolationParams) => string

  // Pluralization
  tc: (key: MessageKey, count: number, params?: InterpolationParams) => string
  tp: (key: MessageKey, count: number, params?: InterpolationParams) => string

  // Formatting
  d: (value: Date | number | string, format?: string) => string
  n: (value: number, format?: string) => string

  // Locale management
  setLocale: (locale: Locale) => Promise<void>
  getLocale: () => Locale
  setFallbackLocale: (locale: Locale | Locale[]) => void
  getFallbackLocale: () => Locale | Locale[]

  // Message management
  mergeLocaleMessage: (locale: Locale, messages: Record<string, any>) => void
  getLocaleMessage: (locale: Locale) => Record<string, any>
  setLocaleMessage: (locale: Locale, messages: Record<string, any>) => void
}

/**
 * useI18n primitive
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, locale, setLocale } = useI18n()
 *   
 *   return (
 *     <div>
 *       <h1>{t('hello')}</h1>
 *       <p>Current: {locale()}</p>
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
      '[useI18n] No i18n instance found. Make sure to wrap your component with <I18nProvider>.'
    )
  }

  const i18n = context.i18n

  // Create reactive signals
  const [locale, setLocaleSignal] = createSignal<Locale>(i18n.locale || 'en')
  const [fallbackLocale, setFallbackLocaleSignal] = createSignal<Locale | Locale[]>(
    i18n.fallbackLocale || 'en'
  )

  // Listen to locale changes
  const unsubscribe = i18n.on('localeChanged', ({ locale: newLocale }) => {
    if (newLocale) {
      setLocaleSignal(newLocale)
    }
  })

  // Cleanup
  onCleanup(() => {
    if (unsubscribe && typeof unsubscribe === 'function') {
      unsubscribe()
    }
  })

  // Computed properties
  const messages = createMemo(() => i18n.getMessages(locale()) || {})
  const availableLocales = createMemo(() => i18n.getAvailableLocales())

  // Translation function
  const t = (key: MessageKey, params?: InterpolationParams | TranslateOptions): string => {
    const actualKey = namespace ? `${namespace}.${key}` : key
    return i18n.t(actualKey, params)
  }

  // Check if translation exists
  const te = (key: MessageKey, checkLocale?: Locale): boolean => {
    const actualKey = namespace ? `${namespace}.${key}` : key
    return i18n.exists(actualKey, { locale: checkLocale })
  }

  // Get raw message
  const tm = (key: MessageKey): any => {
    const actualKey = namespace ? `${namespace}.${key}` : key
    const msgs = i18n.getMessages(locale())
    if (!msgs) return undefined

    const keys = actualKey.split('.')
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
    if ('interpolation' in i18n && i18n.interpolation) {
      return (i18n as any).interpolation.interpolate(message, params || {}, locale())
    }
    return message
  }

  // Pluralization
  const tc = (key: MessageKey, count: number, params?: InterpolationParams): string => {
    const actualKey = namespace ? `${namespace}.${key}` : key
    return i18n.plural(actualKey, count, { params })
  }

  // Date formatting
  const d = (value: Date | number | string, format?: string): string => {
    return i18n.date(value, format ? { dateStyle: format as any } : undefined)
  }

  // Number formatting
  const n = (value: number, format?: string): string => {
    if (format === 'currency') {
      return i18n.currency(value, 'USD')
    } else if (format === 'percent') {
      return i18n.number(value, { style: 'percent' })
    }
    return i18n.number(value)
  }

  // Locale management
  const setLocale = async (newLocale: Locale): Promise<void> => {
    await i18n.setLocale(newLocale)
    setLocaleSignal(newLocale)
  }

  const getLocale = (): Locale => locale()

  const setFallbackLocale = (newFallback: Locale | Locale[]): void => {
    i18n.fallbackLocale = newFallback
    setFallbackLocaleSignal(newFallback)
  }

  const getFallbackLocale = (): Locale | Locale[] => fallbackLocale()

  // Message management
  const mergeLocaleMessage = (loc: Locale, msgs: Record<string, any>): void => {
    i18n.mergeMessages(loc, msgs, namespace)
  }

  const getLocaleMessage = (loc: Locale): Record<string, any> => {
    return i18n.getMessages(loc, namespace) || {}
  }

  const setLocaleMessage = (loc: Locale, msgs: Record<string, any>): void => {
    i18n.setMessages(loc, msgs, namespace)
  }

  return {
    // Properties
    locale,
    fallbackLocale,
    messages,
    availableLocales,

    // Methods
    t,
    te,
    tm,
    rt,
    tc,
    tp: tc, // Alias
    d,
    n,

    // Locale management
    setLocale,
    getLocale,
    setFallbackLocale,
    getFallbackLocale,

    // Message management
    mergeLocaleMessage,
    getLocaleMessage,
    setLocaleMessage,
  }
}

