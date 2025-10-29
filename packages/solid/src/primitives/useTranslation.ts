/**
 * useTranslation - Translation functions primitive
 */

import type { InterpolationParams, Locale, MessageKey, TranslateOptions } from '@ldesign/i18n-core'
import { useContext } from 'solid-js'
import { I18nContext } from '../context/I18nContext'

export interface UseTranslationOptions {
  /**
   * Namespace prefix for translations
   */
  namespace?: string
}

export interface UseTranslationReturn {
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
}

/**
 * useTranslation primitive for translation functions
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, tc } = useTranslation()
 *   
 *   return (
 *     <div>
 *       <h1>{t('hello')}</h1>
 *       <p>{tc('items', 5)}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useTranslation(options: UseTranslationOptions = {}): UseTranslationReturn {
  const { namespace } = options
  const context = useContext(I18nContext)

  if (!context || !context.i18n) {
    throw new Error(
      '[useTranslation] No i18n instance found. Make sure to wrap your component with <I18nProvider>.'
    )
  }

  const i18n = context.i18n

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
    const locale = i18n.locale
    const msgs = i18n.getMessages(locale)
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
      return (i18n as any).interpolation.interpolate(message, params || {}, i18n.locale)
    }
    return message
  }

  // Pluralization
  const tc = (key: MessageKey, count: number, params?: InterpolationParams): string => {
    const actualKey = namespace ? `${namespace}.${key}` : key
    return i18n.plural(actualKey, count, { params })
  }

  return {
    t,
    te,
    tm,
    rt,
    tc,
    tp: tc, // Alias
  }
}

