/**
 * @ldesign/i18n-qwik - Hooks
 * Qwik hooks for i18n
 */

import { useContext } from '@builder.io/qwik'
import { I18nContext } from '../context'
import type { I18nInstance } from '@ldesign/i18n-core'

/**
 * Use i18n instance
 */
export function useI18n(): I18nInstance {
  const i18n = useContext(I18nContext)
  if (!i18n) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return i18n
}

/**
 * Use translation function
 */
export function useTranslation() {
  const i18n = useI18n()
  
  const t = (key: string, params?: Record<string, any>) => i18n.t(key, params)

  return { t, i18n, locale: i18n.locale }
}

/**
 * Use current locale
 */
export function useLocale() {
  const i18n = useI18n()
  
  const setLocale = async (newLocale: string) => {
    await i18n.setLocale(newLocale)
  }

  return { locale: i18n.locale, setLocale }
}

export type { I18nInstance }
