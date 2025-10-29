import { useContext } from 'react'
import { I18nContext } from '../context'

export function useI18n() {
  const i18n = useContext(I18nContext)

  if (!i18n) {
    throw new Error('useI18n must be used within I18nProvider')
  }

  return i18n
}

export function useTranslation() {
  const i18n = useI18n()

  return {
    t: i18n.t.bind(i18n),
    locale: i18n.locale,
    setLocale: (locale: string) => {
      i18n.locale = locale
    },
    availableLocales: i18n.availableLocales,
  }
}

export function useLocale() {
  const i18n = useI18n()

  return {
    locale: i18n.locale,
    setLocale: (locale: string) => {
      i18n.locale = locale
    },
  }
}
