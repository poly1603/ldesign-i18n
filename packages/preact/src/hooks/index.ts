/**
 * @ldesign/i18n-preact - Hooks
 * Preact hooks for i18n
 */

import { useContext, useState, useEffect, useMemo } from 'preact/hooks'
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
  const [, forceUpdate] = useState({})

  useEffect(() => {
    const handleLocaleChange = () => forceUpdate({})
    // Assuming i18n has event emitter capability
    // This is a simplified version
    return () => {
      // Cleanup
    }
  }, [i18n])

  const t = useMemo(
    () => (key: string, params?: Record<string, any>) => i18n.t(key, params),
    [i18n],
  )

  return { t, i18n, locale: i18n.locale }
}

/**
 * Use current locale
 */
export function useLocale(): [string, (locale: string) => Promise<void>] {
  const i18n = useI18n()
  const [locale, setLocaleState] = useState(i18n.locale)

  const setLocale = async (newLocale: string) => {
    await i18n.setLocale(newLocale)
    setLocaleState(newLocale)
  }

  return [locale, setLocale]
}

export type { I18nInstance }
