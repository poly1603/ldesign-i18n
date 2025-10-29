import { computed, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import type { I18nInstance } from '@ldesign/i18n-core'

export function useI18n() {
  const nuxtApp = useNuxtApp()
  const i18n = nuxtApp.$i18n as I18nInstance

  if (!i18n) {
    throw new Error('i18n instance not found')
  }

  // Reactive locale
  const locale = ref(i18n.locale)

  // Watch for locale changes
  watch(locale, (newLocale) => {
    i18n.locale = newLocale
  })

  // Listen to i18n locale changes
  i18n.on('localeChanged', (newLocale) => {
    locale.value = newLocale
  })

  return {
    t: i18n.t.bind(i18n),
    locale: computed({
      get: () => locale.value,
      set: (val) => {
        locale.value = val
      },
    }),
    availableLocales: computed(() => i18n.availableLocales),
    setLocale: (newLocale: string) => {
      locale.value = newLocale
    },
  }
}

export function useLocale() {
  const { locale, setLocale } = useI18n()
  return { locale, setLocale }
}

export function useTranslation() {
  const { t, locale } = useI18n()
  return { t, locale }
}
