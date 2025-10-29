/**
 * useLocale - Locale management primitive
 */

import type { Locale } from '@ldesign/i18n-core'
import { createMemo, createSignal, onCleanup, useContext } from 'solid-js'
import type { Accessor } from 'solid-js'
import { I18nContext } from '../context/I18nContext'

export interface UseLocaleReturn {
  /**
   * Current locale (reactive)
   */
  locale: Accessor<Locale>

  /**
   * Available locales (reactive)
   */
  availableLocales: Accessor<Locale[]>

  /**
   * Set locale
   */
  setLocale: (locale: Locale) => Promise<void>

  /**
   * Get locale
   */
  getLocale: () => Locale
}

/**
 * useLocale primitive for locale management
 * 
 * @example
 * ```tsx
 * function LanguageSwitcher() {
 *   const { locale, availableLocales, setLocale } = useLocale()
 *   
 *   return (
 *     <select value={locale()} onChange={(e) => setLocale(e.target.value)}>
 *       {availableLocales().map(loc => (
 *         <option value={loc}>{loc}</option>
 *       ))}
 *     </select>
 *   )
 * }
 * ```
 */
export function useLocale(): UseLocaleReturn {
  const context = useContext(I18nContext)

  if (!context || !context.i18n) {
    throw new Error(
      '[useLocale] No i18n instance found. Make sure to wrap your component with <I18nProvider>.'
    )
  }

  const i18n = context.i18n

  // Create reactive signal
  const [locale, setLocaleSignal] = createSignal<Locale>(i18n.locale || 'en')

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
  const availableLocales = createMemo(() => i18n.getAvailableLocales())

  // Locale management
  const setLocale = async (newLocale: Locale): Promise<void> => {
    await i18n.setLocale(newLocale)
    setLocaleSignal(newLocale)
  }

  const getLocale = (): Locale => locale()

  return {
    locale,
    availableLocales,
    setLocale,
    getLocale,
  }
}

