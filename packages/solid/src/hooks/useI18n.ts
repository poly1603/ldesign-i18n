import { createSignal, createEffect } from 'solid-js'
import { useI18nContext } from '../context/I18nContext'

export function useI18n() {
  return useI18nContext()
}

export function useTranslation() {
  const i18n = useI18nContext()
  const [locale, setLocale] = createSignal(i18n.locale)

  // Listen to locale changes
  createEffect(() => {
    i18n.on('localeChanged', (newLocale) => {
      setLocale(newLocale)
    })
  })

  return {
    t: i18n.t.bind(i18n),
    locale,
    setLocale: (newLocale: string) => {
      i18n.locale = newLocale
    },
    availableLocales: () => i18n.availableLocales,
  }
}

export function useLocale() {
  const i18n = useI18nContext()
  const [locale, setLocale] = createSignal(i18n.locale)

  createEffect(() => {
    i18n.on('localeChanged', (newLocale) => {
      setLocale(newLocale)
    })
  })

  return {
    locale,
    setLocale: (newLocale: string) => {
      i18n.locale = newLocale
    },
  }
}
